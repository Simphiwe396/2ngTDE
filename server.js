// server.js (CommonJS - copy this file exactly)
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config();
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from /public
app.use(express.static(path.join(process.cwd(), 'public')));

// MongoDB connection (optional)
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, { dbName: 'clinchglow' })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Mongo connection error', err));
} else {
  console.log('MONGO_URI not set — running without DB persistence.');
}

const orderSchema = new mongoose.Schema({
  sessionId: String,
  items: Array,
  amount: Number,
  currency: String,
  customer: Object,
  status: { type: String, default: 'created' },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// Serve products.json
app.get('/products.json', (req, res) => {
  const p = path.join(process.cwd(), 'public', 'products.json');
  if (fs.existsSync(p)) {
    res.type('json').send(fs.readFileSync(p, 'utf8'));
  } else {
    res.json({ products: [] });
  }
});

// Helper to build PayFast form HTML (auto submit)
function buildPayfastForm(params, isSandbox) {
  const endpoint = isSandbox ? 'https://sandbox.payfast.co.za/eng/process' : 'https://www.payfast.co.za/eng/process';
  const inputs = Object.keys(params).map(k => {
    const v = String(params[k]).replace(/"/g, '&quot;');
    return `<input type="hidden" name="${k}" value="${v}"/>`;
  }).join('\n');
  return `<!doctype html><html><head><meta charset="utf-8"><title>Redirecting to PayFast</title></head><body><form id="pf" action="${endpoint}" method="post">${inputs}</form><script>document.getElementById('pf').submit();</script></body></html>`;
}

// Create PayFast transaction (form post returns auto-submit HTML)
app.post('/api/create-payfast', async (req, res) => {
  try {
    const merchant_id = process.env.PAYFAST_MERCHANT_ID;
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY;
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    const isSandbox = (process.env.PAYFAST_SANDBOX === '1' || process.env.PAYFAST_SANDBOX === 'true');

    if (!merchant_id || !merchant_key) return res.status(500).send('PayFast not configured');

    const customer = req.body.customer ? JSON.parse(req.body.customer) : {};
    const items = req.body.items ? JSON.parse(req.body.items) : [];

    const amount = items.reduce((s, i) => s + (i.price * (i.qty || 1)), 0).toFixed(2);

    const pfData = {
      merchant_id,
      merchant_key,
      return_url: (process.env.PUBLIC_URL || '') + '/success.html',
      cancel_url: (process.env.PUBLIC_URL || '') + '/cancel.html',
      notify_url: (process.env.PUBLIC_URL || '') + '/api/payfast-itn',
      m_payment_id: String(Date.now()),
      amount,
      item_name: 'ClinchGlow Order',
      email_address: customer.email || ''
    };

    // Create md5 signature per PayFast docs
    const pfKeys = Object.keys(pfData).sort();
    const pfString = pfKeys.map(k => `${k}=${pfData[k]}`).join('&') + (passphrase ? `&passphrase=${passphrase}` : '');
    const signature = crypto.createHash('md5').update(pfString).digest('hex');
    pfData.signature = signature;

    if (process.env.MONGO_URI) {
      await Order.create({ sessionId: pfData.m_payment_id, items, amount: parseFloat(amount), currency: 'ZAR', customer, status: 'pending' });
    }

    res.send(buildPayfastForm(pfData, isSandbox));
  } catch (err) {
    console.error('create-payfast error', err);
    res.status(500).send('Server error');
  }
});

// PayFast ITN handler
app.post('/api/payfast-itn', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const body = req.body || {};
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    const keys = Object.keys(body).filter(k => k !== 'signature').sort();
    const pfString = keys.map(k => `${k}=${body[k]}`).join('&') + (passphrase ? `&passphrase=${passphrase}` : '');
    const computed = crypto.createHash('md5').update(pfString).digest('hex');

    if (computed !== (body.signature || '')) {
      console.warn('Invalid PayFast signature', computed, body.signature);
      return res.status(400).send('Invalid signature');
    }

    const validateUrl = (process.env.PAYFAST_SANDBOX === '1' || process.env.PAYFAST_SANDBOX === 'true') ? 'https://sandbox.payfast.co.za/eng/query/validate' : 'https://www.payfast.co.za/eng/query/validate';
    const params = new URLSearchParams();
    for (const k of Object.keys(body)) params.append(k, body[k]);

    const verifResp = await fetch(validateUrl, { method: 'POST', body: params });
    const text = await verifResp.text();
    if (text.trim() !== 'VALID') {
      console.warn('PayFast validation failed:', text);
      return res.status(400).send('INVALID');
    }

    const m_payment_id = body.m_payment_id;
    const amount_gross = parseFloat(body.amount_gross || '0');
    if (process.env.MONGO_URI && m_payment_id) {
      const order = await Order.findOne({ sessionId: m_payment_id });
      if (order) {
        if (Math.abs(order.amount - amount_gross) > 0.01) {
          order.status = 'amount_mismatch';
          await order.save();
          return res.status(400).send('Amount mismatch');
        }
        order.status = 'paid';
        await order.save();
      } else {
        await Order.create({ sessionId: m_payment_id, items: [], amount: amount_gross, currency: body.currency || 'ZAR', customer: {}, status: 'paid' });
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('ITN handler error', err);
    res.status(500).send('Server error');
  }
});

// Simple admin route (header protected)
const ADMIN_KEY = process.env.ADMIN_KEY || 'change_me_admin_key';
function adminAuth(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!key || key !== ADMIN_KEY) return res.status(401).json({ message: 'Unauthorized' });
  next();
}
app.get('/api/admin/orders', adminAuth, async (req, res) => {
  if (!process.env.MONGO_URI) return res.status(400).json({ message: 'DB not configured' });
  const orders = await Order.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json({ orders });
});

// Fallback to index.html (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Server listening on', PORT));
