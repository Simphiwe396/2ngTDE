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

app.get('/products', (req, res) => {
  try {
    const p = path.join(PUBLIC_DIR, 'products.json');
    if (!fs.existsSync(p)) return res.json([]);
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    return res.json(j.products || j);
  } catch (e) {
    console.error('products load error', e);
    return res.status(500).json([]);
  }
});

app.post('/create-payfast-payment', (req, res) => {
  try {
    const { name, address, phone, cart, email } = req.body;
    const items = Array.isArray(cart) ? cart : [];
    const amount = items.reduce((s,i)=> s + (parseFloat(i.price)||0) * (i.qty||1), 0).toFixed(2);

    const merchant_id = process.env.PAYFAST_MERCHANT_ID;
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY;
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    const isSandbox = (process.env.PAYFAST_SANDBOX === '1' || process.env.PAYFAST_SANDBOX === 'true');

    if (!merchant_id || !merchant_key) return res.status(500).send('PayFast not configured');

    const pfData = {
      merchant_id,
      merchant_key,
      return_url: (process.env.PUBLIC_URL || '') + '/success.html',
      cancel_url: (process.env.PUBLIC_URL || '') + '/cancel.html',
      notify_url: (process.env.PUBLIC_URL || '') + '/payfast-notify',
      m_payment_id: String(Date.now()),
      amount,
      item_name: 'ClinchGlow Order',
      email_address: email || ''
    };

    const keys = Object.keys(pfData).sort();
    const str = keys.map(k=>`${k}=${pfData[k]}`).join('&') + (passphrase?`&passphrase=${passphrase}`:'');
    pfData.signature = crypto.createHash('md5').update(str).digest('hex');

    const endpoint = isSandbox ? 'https://sandbox.payfast.co.za/eng/process' : 'https://www.payfast.co.za/eng/process';
    const inputs = Object.keys(pfData).map(k=>`<input type="hidden" name="${k}" value="${String(pfData[k]).replace(/"/g,'&quot;')}" />`).join('\n');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Redirecting...</title></head><body><form id="pf" action="${endpoint}" method="post">${inputs}</form><script>document.getElementById('pf').submit();</script></body></html>`;
    res.send(html);
  } catch (e) {
    console.error(e);
    res.status(500).send('server error');
  }
});

app.post('/payfast-notify', express.urlencoded({extended:true}), async (req, res) => {
  try {
    const body = req.body || {};
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    const keys = Object.keys(body).filter(k=>k!=='signature').sort();
    const pfString = keys.map(k=>`${k}=${body[k]}`).join('&') + (passphrase?`&passphrase=${passphrase}`:'');
    const computed = crypto.createHash('md5').update(pfString).digest('hex');
    if (computed !== (body.signature||'')) {
      console.warn('Invalid signature', computed, body.signature);
      return res.status(400).send('Invalid signature');
    }
    const validateUrl = (process.env.PAYFAST_SANDBOX==='1' || process.env.PAYFAST_SANDBOX==='true') ? 'https://sandbox.payfast.co.za/eng/query/validate' : 'https://www.payfast.co.za/eng/query/validate';
    const params = new URLSearchParams();
    for (const k of Object.keys(body)) params.append(k, body[k]);
    const vresp = await fetch(validateUrl, { method:'POST', body: params });
    const txt = await vresp.text();
    if (txt.trim() !== 'VALID') {
      console.warn('PayFast validate returned:', txt);
      return res.status(400).send('INVALID');
    }
    console.log('PayFast ITN valid for m_payment_id=', body.m_payment_id);
    res.status(200).send('OK');
  } catch (e) {
    console.error('ITN error', e);
    res.status(500).send('Server error');
  }
});

app.post('/api/order', (req, res) => {
  try {
    const order = req.body || {};
    const ordersFile = path.join(PUBLIC_DIR, 'orders.json');
    let arr = [];
    if (fs.existsSync(ordersFile)) {
      arr = JSON.parse(fs.readFileSync(ordersFile,'utf8')||'[]');
    }
    order.created_at = new Date().toISOString();
    arr.push(order);
    fs.writeFileSync(ordersFile, JSON.stringify(arr,null,2),'utf8');
    res.json({ ok:true, id: arr.length-1 });
  } catch (e) {
    console.error('save order error', e);
    res.status(500).json({ ok:false });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=>console.log('Server listening on', PORT));
