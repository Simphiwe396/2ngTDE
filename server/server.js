// Replace your entire server.js with this:
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Routes
app.get('/api/products', (req, res) => {
  res.json([
    {
      id: 1,
      name: "Premium T-Shirt",
      price: 249.99
    }
  ]);
});

// Handle all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(Server running on port ${PORT});
});