// server.js — Express API for Clinch Glow (with UPDATE route)
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Serve static frontend files from public/
app.use(express.static(path.join(__dirname, 'public')));

// Database pool (expects DATABASE_URL env var)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false
});

// Ensure products table exists
async function ensureTable() {
  const sql = `
  CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    image TEXT,
    category TEXT
  );
  `;
  await pool.query(sql);
}
ensureTable().catch(err => console.error('Table create error', err));

// API: get all products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, price, image, category FROM products ORDER BY id');
    if (result.rows.length === 0) {
      // fallback to bundled products.json if DB empty
      const products = require('./public/products.json');
      return res.json(products);
    }
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({error: 'DB error'});
  }
});

// API: add product
app.post('/api/products', async (req, res) => {
  const { name, price, image, category } = req.body;
  if (!name || price == null) return res.status(400).json({ error: 'name and price required' });
  try {
    const result = await pool.query(
      'INSERT INTO products (name, price, image, category) VALUES ($1,$2,$3,$4) RETURNING id',
      [name, price, image, category]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'DB insert error' });
  }
});

// API: update product (EDIT)
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, image, category } = req.body;

  if (!name || price == null) {
    return res.status(400).json({ error: 'name and price required' });
  }

  try {
    await pool.query(
      'UPDATE products SET name=$1, price=$2, image=$3, category=$4 WHERE id=$5',
      [name, price, image, category, id]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('Update error', e);
    res.status(500).json({ error: 'DB update error' });
  }
});

// API: delete product
app.delete('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    await pool.query('DELETE FROM products WHERE id=$1', [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'DB delete error' });
  }
});

// Fallback to index.html for any other route (SPA-friendly)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server started on port', port));
