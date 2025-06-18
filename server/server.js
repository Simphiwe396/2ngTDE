require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Test Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date() });
});

// Products Route (Essential)
app.get('/api/products', (req, res) => {
  res.json([
    {
      id: 1,
      name: "Premium T-Shirt",
      price: 249.99,
      image: "/images/products/tshirt.jpg" // ← Note the forward slash
    }
  ]);
});

// Fallback Route (Must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error-Handled Server Start
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('💥 Server crashed:', err);
});