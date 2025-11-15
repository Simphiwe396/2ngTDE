const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Orders storage
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Initialize orders
if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, '[]');
}

// Products data
const products = [
    {
        id: 1,
        name: "Midnight Rose",
        description: "Luxurious floral fragrance with rose and musk notes",
        price: 89.99,
        image: "/images/perfume1.jpg",
        category: "perfume"
    },
    {
        id: 2,
        name: "Ocean Breeze",
        description: "Fresh aquatic scent with citrus undertones",
        price: 75.50,
        image: "/images/perfume2.jpg",
        category: "perfume"
    },
    {
        id: 3,
        name: "Silk Elegance Dress",
        description: "Handcrafted silk dress for special occasions",
        price: 149.99,
        image: "/images/clothing1.jpg",
        category: "clothing"
    },
    {
        id: 4,
        name: "Vanilla Dream",
        description: "Warm vanilla and amber fragrance",
        price: 82.00,
        image: "/images/perfume3.jpg",
        category: "perfume"
    },
    {
        id: 5,
        name: "Cashmere Blazer",
        description: "Premium cashmere blazer for sophisticated style",
        price: 199.99,
        image: "/images/clothing2.jpg",
        category: "clothing"
    },
    {
        id: 6,
        name: "Citrus Zest",
        description: "Energetic citrus fragrance for everyday wear",
        price: 65.00,
        image: "/images/perfume4.jpg",
        category: "perfume"
    }
];

// API Routes
app.get('/api/products', (req, res) => {
    res.json(products);
});

app.post('/api/orders', (req, res) => {
    const { customer, email, phone, address, items, total } = req.body;
    
    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
    const newOrder = {
        id: Date.now(),
        customer,
        email,
        phone,
        address,
        items,
        total,
        status: 'pending',
        date: new Date().toLocaleString()
    };
    
    orders.push(newOrder);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    
    res.json({ 
        success: true, 
        orderId: newOrder.id,
        message: 'Order placed successfully! We will contact you soon.' 
    });
});

app.get('/api/orders', (req, res) => {
    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
    res.json(orders);
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🛍️  CLINCH E-commerce running on port ${PORT}`);
    console.log(`👉  Visit: https://twongtde-p9ng.onrender.com`);
});