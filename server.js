const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(express.json());

// Database setup
const db = new sqlite3.Database(':memory:');

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT UNIQUE,
    customer_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    items TEXT,
    total_amount REAL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Products data
const products = [
  {
    id: 1,
    name: "Midnight Rose",
    price: 89.99,
    description: "Luxurious floral fragrance with notes of Bulgarian rose",
    category: "Floral",
    brand: "CLINCH GLOW",
    image: "images/perfume1.jpg",
    features: ["Long-lasting", "Evening wear", "Romantic"]
  },
  {
    id: 2,
    name: "Ocean Breeze",
    price: 75.50,
    description: "Fresh aquatic scent inspired by coastal waves",
    category: "Aquatic", 
    brand: "CLINCH GLOW",
    image: "images/perfume2.jpg",
    features: ["Refreshing", "Day wear", "Summer scent"]
  },
  {
    id: 3,
    name: "Vanilla Dream", 
    price: 82.00,
    description: "Warm vanilla fragrance with hints of amber",
    category: "Oriental",
    brand: "CLINCH GLOW",
    image: "images/perfume3.jpg",
    features: ["Warm", "Comforting", "All-season"]
  },
  {
    id: 4,
    name: "Citrus Zest",
    price: 65.00,
    description: "Energetic citrus scent with bergamot and lemon",
    category: "Citrus",
    brand: "CLINCH GLOW",
    image: "images/perfume4.jpg",
    features: ["Energizing", "Morning wear", "Unisex"]
  },
  {
    id: 5,
    name: "Noir Essence",
    price: 120.00,
    description: "Mysterious blend of oud, leather and smoky notes",
    category: "Woody",
    brand: "CLINCH GLOW",
    image: "images/perfume5.jpg",
    features: ["Mysterious", "Evening wear", "Luxury"]
  },
  {
    id: 6,
    name: "Royal Amber",
    price: 95.00,
    description: "Rich amber fragrance with spices and precious woods",
    category: "Oriental", 
    brand: "CLINCH GLOW",
    image: "images/perfume6.jpg",
    features: ["Royal", "Winter scent", "Elegant"]
  },
  {
    id: 7,
    name: "INUKA Elegance",
    price: 85.00,
    description: "Sophisticated fragrance for the modern individual",
    category: "Floral",
    brand: "INUKA",
    image: "images/inuka1.jpg",
    features: ["Elegant", "Day to Night", "Modern"]
  },
  {
    id: 8,
    name: "INUKA Mystique",
    price: 92.00,
    description: "Mysterious and captivating scent experience",
    category: "Oriental",
    brand: "INUKA",
    image: "images/inuka2.jpg",
    features: ["Mysterious", "Captivating", "Long-lasting"]
  },
  {
    id: 9,
    name: "INUKA Fresh",
    price: 78.00,
    description: "Revitalizing fresh scent for everyday wear",
    category: "Citrus",
    brand: "INUKA",
    image: "images/inuka3.jpg",
    features: ["Fresh", "Energetic", "Everyday wear"]
  },
  {
    id: 10,
    name: "INUKA Royal",
    price: 110.00,
    description: "Premium luxury fragrance for special occasions",
    category: "Woody",
    brand: "INUKA",
    image: "images/inuka4.jpg",
    features: ["Luxury", "Special Occasions", "Premium"]
  },
  {
    id: 11,
    name: "INUKA Serenity",
    price: 88.00,
    description: "Calming and peaceful fragrance experience",
    category: "Floral",
    brand: "INUKA",
    image: "images/inuka5.jpg",
    features: ["Calming", "Peaceful", "Relaxing"]
  },
  {
    id: 12,
    name: "INUKA Passion",
    price: 96.00,
    description: "Intense and passionate fragrance blend",
    category: "Oriental",
    brand: "INUKA",
    image: "images/inuka6.jpg",
    features: ["Intense", "Passionate", "Romantic"]
  }
];

// API Routes
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/product/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find(p => p.id === productId);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Order management
app.post('/api/orders', (req, res) => {
  const { customer_name, email, phone, address, items, total_amount, payment_method } = req.body;
  const order_id = 'CLINCH-GLOW-' + Date.now();
  
  const stmt = db.prepare(`INSERT INTO orders 
    (order_id, customer_name, email, phone, address, items, total_amount, payment_method) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  
  stmt.run([
    order_id, 
    customer_name, 
    email, 
    phone, 
    address, 
    JSON.stringify(items), 
    total_amount, 
    payment_method
  ], function(err) {
    if (err) {
      res.status(500).json({ error: 'Failed to create order' });
    } else {
      res.json({ 
        success: true, 
        order_id: order_id,
        message: 'Order created successfully' 
      });
    }
  });
  stmt.finalize();
});

app.get('/api/orders/:order_id', (req, res) => {
  const order_id = req.params.order_id;
  
  db.get(`SELECT * FROM orders WHERE order_id = ?`, [order_id], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  });
});

// PayShap payment simulation
app.post('/api/payment/payshap', (req, res) => {
  const { order_id, amount, phone_number } = req.body;
  
  setTimeout(() => {
    const payment_success = Math.random() > 0.1;
    
    if (payment_success) {
      db.run(`UPDATE orders SET payment_status = 'paid', status = 'confirmed' WHERE order_id = ?`, [order_id]);
      
      res.json({
        success: true,
        payment_id: 'PSH' + Date.now(),
        message: 'Payment processed successfully via PayShap'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment failed. Please try again.'
      });
    }
  }, 2000);
});

// Serve main pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/shop', (req, res) => {
  res.sendFile(path.join(__dirname, 'shop.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'cart.html'));
});

app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'blog.html'));
});

app.get('/sproduct', (req, res) => {
  res.sendFile(path.join(__dirname, 'sproduct.html'));
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Page Not Found - CLINCH GLOW</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #088178; }
            a { color: #088178; text-decoration: none; }
        </style>
    </head>
    <body>
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/">Return to Homepage</a>
    </body>
    </html>
  `);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🛍️ CLINCH GLOW Perfume Store running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`🚀 Server is ready!`);
});