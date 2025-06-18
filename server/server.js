const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Critical middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Products API (Fixed Route)
app.get('/api/products', (req, res) => {
  res.json([
    {
      id: 1,
      name: "Premium T-Shirt",
      price: 249.99,
      image: "images/products/tshirt.jpg",
      rating: 4.5
    },
    {
      id: 2,
      name: "Designer Jeans", 
      price: 599.99,
      image: "images/products/jeans.jpg",
      rating: 4.2
    }
  ]);
});

// Fallback route (Must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error-handled server start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server failed:', err);
});