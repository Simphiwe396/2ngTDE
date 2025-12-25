const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const fs = require('fs').promises;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// PostgreSQL Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ PostgreSQL database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL database error:', err);
});

// Ensure products table exists
async function ensureTable() {
  try {
    const sql = `
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
    
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50),
      shipping_address TEXT NOT NULL,
      items JSONB NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL,
      shipping DECIMAL(10,2) NOT NULL DEFAULT 0,
      total DECIMAL(10,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      payment_status VARCHAR(50) DEFAULT 'pending',
      stripe_session_id VARCHAR(255),
      payment_intent_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id),
      stripe_payment_id VARCHAR(255) UNIQUE NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'ZAR',
      status VARCHAR(50) NOT NULL,
      receipt_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
    
    await pool.query(sql);
    console.log('✅ Database tables ensured');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
}

// Initialize database
ensureTable();

// API: Get all products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, price, image, category, brand, created_at FROM products ORDER BY created_at DESC'
    );
    
    if (result.rows.length === 0) {
      // Fallback to products.json if DB is empty
      const productsData = await fs.readFile(path.join(__dirname, 'public', 'products.json'), 'utf8');
      const products = JSON.parse(productsData);
      return res.json(products);
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    // Fallback to local file
    try {
      const productsData = await fs.readFile(path.join(__dirname, 'public', 'products.json'), 'utf8');
      const products = JSON.parse(productsData);
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: 'Failed to load products' });
    }
  }
});

// API: Add product
app.post('/api/products', async (req, res) => {
  const { name, price, image, category, brand } = req.body;
  
  if (!name || price == null) {
    return res.status(400).json({ error: 'Name and price are required' });
  }
  
  try {
    const result = await pool.query(
      `INSERT INTO products (name, price, image, category, brand) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, price, image, category, brand, created_at`,
      [name, price, image || 'img/placeholder.jpg', category || 'Other', brand || '']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// API: Update product
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, image, category, brand } = req.body;
  
  if (!name || price == null) {
    return res.status(400).json({ error: 'Name and price are required' });
  }
  
  try {
    const result = await pool.query(
      `UPDATE products 
       SET name = $1, price = $2, image = $3, category = $4, brand = $5, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $6 
       RETURNING id, name, price, image, category, brand`,
      [name, price, image || 'img/placeholder.jpg', category || 'Other', brand || '', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// API: Delete product
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// API: Create order
app.post('/api/orders', async (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items,
    subtotal,
    shipping,
    total,
    orderNumber
  } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO orders (
        order_number, customer_name, customer_email, customer_phone, 
        shipping_address, items, subtotal, shipping, total
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, order_number, status, created_at`,
      [
        orderNumber || `CG-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        JSON.stringify(items),
        subtotal,
        shipping || 0,
        total
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// API: Update order payment status
app.put('/api/orders/:id/payment', async (req, res) => {
  const { id } = req.params;
  const { paymentStatus, stripeSessionId, paymentIntentId } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE orders 
       SET payment_status = $1, stripe_session_id = $2, payment_intent_id = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 
       RETURNING id, order_number, status, payment_status`,
      [paymentStatus, stripeSessionId, paymentIntentId, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// API: Get order by session ID
app.get('/api/orders/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE stripe_session_id = $1',
      [sessionId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// All other routes to homepage - FIXED: store.html is homepage
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'store.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📊 Database URL: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);
});