// server.js (CommonJS)
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('cors')());

const PUBLIC_DIR = path.join(process.cwd(), 'public');
app.use(express.static(PUBLIC_DIR));

// Utility: read products.json
function readJSON(filePath, fallback = null) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('readJSON error', e);
    return fallback;
  }
}

// PRODUCTS endpoint
app.get('/products', (req, res) => {
  const p = path.join(PUBLIC_DIR, 'products.json');
  const json = readJSON(p, { products: [] });
  // return array for convenience
  return res.json(json.products || json);
});

// ORDERS storage file path
const ordersFile = path.join(PUBLIC_DIR, 'orders.json');
function loadOrders() {
  const j = readJSON(ordersFile, []);
  return Array.isArray(j) ? j : [];
}
function saveOrders(arr) {
  fs.writeFileSync(ordersFile, JSON.stringify(arr, null, 2), 'utf8');
}

// Save order endpoint (optional direct API)
app.post('/api/order', (req, res) => {
  const order = req.body || {};
  const orders = loadOrders();
  // assign unique id (timestamp + random)
  const id = 'ord_' + Date.now();
  order.id = id;
  order.created_at = new Date().toISOString();
  order.status = 'pending';
  orders.push(order);
  saveOrders(orders);
  return res.json({ ok: true, id });
});

// Create PayFast payment: save order first, then return auto-post form
app.post('/create-payfast-payment', (req, res) => {
  try {
    const payload = req.body || {}; // { name, email, phone, address, cart: [...] }
    const orders = loadOrders();
    const orderId = 'ord_' + Date.now();
    const order = {
      id: orderId,
      customer: {
        name: payload.name || '',
        email: payload.email || '',
        phone: payload.phone || '',
        address: payload.address || ''
      },
      cart: Array.isArray(payload.cart) ? payload.cart : [],
      amount: (Array.isArray(payload.cart) ? payload.cart.reduce((s,i)=> s + (parseFloat(i.price)||0) * (i.qty||1), 0) : 0).toFixed(2),
      status: 'pending',
      created_at: new Date().toISOString()
    };
    orders.push(order);
    saveOrders(orders);

    const merchant_id = process.env.PAYFAST_MERCHANT_ID;
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY;
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    const isSandbox = (process.env.PAYFAST_SANDBOX === '1' || process.env.PAYFAST_SANDBOX === 'true');
    if (!merchant_id || !merchant_key) {
      return res.status(500).send('PayFast credentials not configured on server.');
    }

    // PayFast data
    const pfData = {
      merchant_id,
      merchant_key,
      return_url: (process.env.PUBLIC_URL || '') + '/success.html',
      cancel_url: (process.env.PUBLIC_URL || '') + '/cancel.html',
      notify_url: (process.env.PUBLIC_URL || '') + '/payfast-notify',
      m_payment_id: orderId,
      amount: order.amount,
      item_name: 'ClinchGlow Order ' + orderId,
      email_address: order.customer.email || ''
    };

    // signature (simple MD5 per PayFast docs when using passphrase)
    const keys = Object.keys(pfData).sort();
    const str = keys.map(k => `${k}=${pfData[k]}`).join('&') + (passphrase ? `&passphrase=${passphrase}` : '');
    pfData.signature = crypto.createHash('md5').update(str).digest('hex');

    const endpoint = isSandbox ? 'https://sandbox.payfast.co.za/eng/process' : 'https://www.payfast.co.za/eng/process';
    const inputs = Object.keys(pfData).map(k => `<input type="hidden" name="${k}" value="${String(pfData[k]).replace(/"/g, '&quot;')}" />`).join('\n');

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Redirecting to PayFast</title></head><body><form id="pf" action="${endpoint}" method="post">${inputs}</form><script>document.getElementById('pf').submit();</script></body></html>`;
    return res.send(html);
  } catch (e) {
    console.error('create-payfast-payment error', e);
    return res.status(500).send('Server error');
  }
});

// PayFast ITN (instant transaction notification) endpoint
app.post('/payfast-notify', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const body = req.body || {};
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    // Build PF string for signature verification (exclude signature)
    const keys = Object.keys(body).filter(k => k !== 'signature').sort();
    const pfString = keys.map(k => `${k}=${body[k]}`).join('&') + (passphrase ? `&passphrase=${passphrase}` : '');
    const computed = crypto.createHash('md5').update(pfString).digest('hex');

    if ((body.signature || '') !== computed) {
      console.warn('PayFast signature mismatch', computed, body.signature);
      return res.status(400).send('Invalid signature');
    }

    // Ask PayFast to validate (optional, but recommended)
    const validateUrl = (process.env.PAYFAST_SANDBOX === '1' || process.env.PAYFAST_SANDBOX === 'true') ? 'https://sandbox.payfast.co.za/eng/query/validate' : 'https://www.payfast.co.za/eng/query/validate';
    const params = new URLSearchParams();
    Object.keys(body).forEach(k => params.append(k, body[k]));

    const vresp = await fetch(validateUrl, { method: 'POST', body: params });
    const txt = await vresp.text();

    if (txt.trim() !== 'VALID') {
      console.warn('PayFast validate returned:', txt);
      return res.status(400).send('INVALID');
    }

    // Update order status
    const orders = loadOrders();
    const idx = orders.findIndex(o => o.id === (body.m_payment_id || body.m_payment_id));
    if (idx >= 0) {
      orders[idx].status = body.payment_status || 'COMPLETED';
      orders[idx].payfast = body; // store raw notification
      saveOrders(orders);
    } else {
      console.warn('order not found for m_payment_id', body.m_payment_id);
    }
    res.status(200).send('OK');
  } catch (e) {
    console.error('ITN error', e);
    res.status(500).send('Server error');
  }
});

// Track order: returns JSON for given id
app.get('/api/track/:id', (req, res) => {
  const id = req.params.id;
  const orders = loadOrders();
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ ok: false, message: 'Order not found' });
  return res.json({ ok: true, order });
});

// Provide orders list for admin (served as static file /orders.json as well)
// (already saved to PUBLIC_DIR/orders.json, which is static)

app.get('*', (req, res) => {
  // fallback to index.html for SPA pages
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Server running on port', PORT));
