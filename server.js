const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config();
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from public
app.use(express.static(path.join(process.cwd(), 'public')));

// MongoDB connection
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DBNAME || 'clinchglow' })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Mongo connection error', err));
} else {
  console.log('MONGO_URI not set — running without DB persistence.');
}

// Schemas
const ProductSchema = new mongoose.Schema({ name: String, price: Number, image: String, category: String });
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const OrderSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  cart: Array,
  amount: Number,
  pf_payment_id: String,
  payment_status: { type: String, default: 'PENDING' },
  created_at: { type: Date, default: Date.now }
});
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

// Admin auth helper
function adminAuth(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) return res.status(401).json({ message: 'Unauthorized' });
  next();
}

// Products endpoints
app.get('/api/products', async (req, res) => {
  try {
    if (process.env.MONGO_URI) {
      const list = await Product.find().limit(500);
      return res.json(list);
    }
    const p = path.join(process.cwd(), 'public', 'products.json');
    if (fs.existsSync(p)) {
      const j = JSON.parse(fs.readFileSync(p,'utf8'));
      return res.json(j.products || j);
    }
    res.json([]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server' }); }
});

app.post('/api/products', adminAuth, async (req, res) => {
  try {
    const p = new Product(req.body); await p.save(); res.json({ ok: true, p });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/products/:id', adminAuth, async (req, res) => {
  try { await Product.findByIdAndDelete(req.params.id); res.json({ ok: true }); } catch (e) { res.status(500).json({ error: e.message }); }
});

// Orders endpoints
app.get('/api/orders', adminAuth, async (req, res) => {
  const orders = await Order.find().sort({ created_at: -1 }).limit(500).lean();
  res.json(orders);
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const o = await Order.findById(req.params.id).lean();
    if (!o) return res.status(404).json({ error: 'not found' });
    res.json(o);
  } catch (e) { res.status(400).json({ error: 'bad id' }); }
});

// Create PayFast transaction and save pending order
app.post('/create-payfast-payment', async (req, res) => {
  try {
    const { name, address, phone, cart, email } = req.body;
    const items = Array.isArray(cart) ? cart : [];
    const amount = items.reduce((s, i) => s + (parseFloat(i.price) || 0) * (i.qty || 1), 0).toFixed(2);

    // Save order as PENDING
    let savedOrder = null;
    if (process.env.MONGO_URI) {
      const ord = new Order({ name, address, phone, cart: items, amount: parseFloat(amount), payment_status: 'PENDING' });
      savedOrder = await ord.save();
    }

    const merchant_id = process.env.PAYFAST_MERCHANT_ID;
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY;
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    const isSandbox = (process.env.PAYFAST_SANDBOX === '1' || process.env.PAYFAST_SANDBOX === 'true');

    if (!merchant_id || !merchant_key) return res.status(500).json({ error: 'payfast not configured' });

    const pfData = {
      merchant_id,
      merchant_key,
      return_url: (process.env.PUBLIC_URL || '') + '/success.html',
      cancel_url: (process.env.PUBLIC_URL || '') + '/cancel.html',
      notify_url: (process.env.PUBLIC_URL || '') + '/payfast-notify',
      m_payment_id: savedOrder ? String(savedOrder._id) : String(Date.now()),
      amount,
      item_name: 'ClinchGlow Order',
      email_address: email || ''
    };

    // Create signature
    const keys = Object.keys(pfData).sort();
    const str = keys.map(k => `${k}=${pfData[k]}`).join('&') + (passphrase ? `&passphrase=${passphrase}` : '');
    pfData.signature = crypto.createHash('md5').update(str).digest('hex');

    const endpoint = isSandbox ? 'https://sandbox.payfast.co.za/eng/process' : 'https://www.payfast.co.za/eng/process';
    const inputs = Object.keys(pfData).map(k => `<input type="hidden" name="${k}" value="${String(pfData[k]).replace(/"/g, '&quot;')}" />`).join('\n');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Redirecting...</title></head><body><form id="pf" action="${endpoint}" method="post">${inputs}</form><script>document.getElementById('pf').submit();</script></body></html>`;
    res.send(html);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// PayFast notify (ITN)
app.post('/payfast-notify', async (req, res) => {
  try {
    const body = req.body || {};
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    const keys = Object.keys(body).filter(k => k !== 'signature').sort();
    const pfString = keys.map(k => `${k}=${body[k]}`).join('&') + (passphrase ? `&passphrase=${passphrase}` : '');
    const computed = crypto.createHash('md5').update(pfString).digest('hex');

    if (computed !== (body.signature || '')) {
      console.warn('PayFast invalid signature', computed, body.signature);
      return res.status(400).send('Invalid signature');
    }

    const validateUrl = (process.env.PAYFAST_SANDBOX === '1' || process.env.PAYFAST_SANDBOX === 'true') ? 'https://sandbox.payfast.co.za/eng/query/validate' : 'https://www.payfast.co.za/eng/query/validate';
    const params = new URLSearchParams();
    for (const k of Object.keys(body)) params.append(k, body[k]);
    const vresp = await fetch(validateUrl, { method: 'POST', body: params });
    const txt = await vresp.text();
    if (txt.trim() !== 'VALID') {
      console.warn('PayFast validate returned:', txt);
      return res.status(400).send('INVALID');
    }

    const orderId = body.m_payment_id;
    const amount_gross = parseFloat(body.amount_gross || body.amount || '0');

    if (process.env.MONGO_URI && orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        if (Math.abs(order.amount - amount_gross) > 0.01) {
          order.payment_status = 'AMOUNT_MISMATCH';
          await order.save();
          return res.status(400).send('Amount mismatch');
        }
        order.pf_payment_id = body.pf_payment_id || '';
        order.payment_status = body.payment_status || 'COMPLETE';
        await order.save();
      } else {
        await Order.create({ name: '-', address: '', phone: '', cart: [], amount: amount_gross, pf_payment_id: body.pf_payment_id || '', payment_status: body.payment_status || 'COMPLETE' });
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('ITN error', err);
    res.status(500).send('Server error');
  }
});

// Admin send SMS endpoint placeholder (no Twilio)
app.post('/api/orders/:id/send-sms', adminAuth, async (req, res) => {
  // Twilio not configured in this build. Return success to avoid errors.
  res.json({ ok: false, message: 'SMS not configured on this build' });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Server running on', PORT));
