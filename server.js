const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const fs = require('fs').promises;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let pool = null;
let dbEnabled = false;

/* ===============================
   DATABASE SETUP (SAFE MODE)
================================= */

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSLMODE === 'require'
      ? { rejectUnauthorized: false }
      : false
  });

  pool.on('connect', () => {
    console.log('✅ PostgreSQL connected');
    dbEnabled = true;
  });

  pool.on('error', (err) => {
    console.error('❌ PostgreSQL error:', err.message);
    dbEnabled = false;
  });
} else {
  console.log('⚠️ DATABASE_URL not set — running in JSON fallback mode');
}

/* ===============================
   ENSURE TABLES (ONLY IF DB ON)
================================= */

async function ensureTables() {
  if (!dbEnabled) return;

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image TEXT,
        category VARCHAR(100),
        brand VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Tables ready");
  } catch (err) {
    console.error("❌ Table creation failed:", err.message);
  }
}

ensureTables();

/* ===============================
   PRODUCTS API
================================= */

app.get('/api/products', async (req, res) => {
  try {
    if (dbEnabled) {
      const result = await pool.query(
        'SELECT id, name, price, image, category, brand FROM products ORDER BY created_at DESC'
      );
      return res.json(result.rows);
    }

    // JSON fallback
    const data = await fs.readFile(
      path.join(__dirname, 'public', 'products.json'),
      'utf8'
    );
    return res.json(JSON.parse(data));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load products" });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, price, image, category, brand } = req.body;

  if (!name || price == null) {
    return res.status(400).json({ error: "Name and price required" });
  }

  if (!dbEnabled) {
    return res.status(400).json({
      error: "Database not enabled. Cannot add products in JSON mode."
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products (name, price, image, category, brand)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [
        name,
        price,
        image || '',
        category || 'Other',
        brand || ''
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

/* ===============================
   HEALTH CHECK
================================= */

app.get('/api/health', (req, res) => {
  res.json({
    status: "running",
    database: dbEnabled ? "connected" : "disabled",
    time: new Date().toISOString()
  });
});

/* ===============================
   FRONTEND ROUTING FIX
================================= */

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'store.html'));
});

/* ===============================
   START SERVER
================================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});