const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware - Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Additional explicit routes for CSS and JS
app.use('/styles', express.static(path.join(__dirname, 'public', 'styles')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/scripts', express.static(path.join(__dirname, 'public', 'scripts')));

app.use(express.json());

// Data files
const ORDERS_FILE = path.join(__dirname, 'orders.json');
const MESSAGES_FILE = path.join(__dirname, 'messages.json');
const SUBSCRIBERS_FILE = path.join(__dirname, 'subscribers.json');

// Initialize data files
[ORDERS_FILE, MESSAGES_FILE, SUBSCRIBERS_FILE].forEach(file => {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, '[]');
    }
});

// Products data
const products = [
    {
        id: 1,
        name: "Midnight Rose",
        description: "Luxurious floral fragrance with rose and musk notes",
        price: 89.99,
        image: "images/perfume1.jpg",
        category: "perfume",
        featured: true
    },
    {
        id: 2,
        name: "Ocean Breeze", 
        description: "Fresh aquatic scent with citrus undertones",
        price: 75.50,
        image: "images/perfume2.jpg",
        category: "perfume"
    },
    {
        id: 3,
        name: "Silk Elegance Dress",
        description: "Handcrafted silk dress for special occasions",
        price: 149.99,
        image: "images/clothing1.jpg",
        category: "clothing"
    },
    {
        id: 4,
        name: "Vanilla Dream",
        description: "Warm vanilla and amber fragrance", 
        price: 82.00,
        image: "images/perfume3.jpg",
        category: "perfume"
    },
    {
        id: 5,
        name: "Cashmere Blazer",
        description: "Premium cashmere blazer for sophisticated style",
        price: 199.99,
        image: "images/clothing2.jpg", 
        category: "clothing"
    },
    {
        id: 6,
        name: "Citrus Zest",
        description: "Energetic citrus fragrance for everyday wear",
        price: 65.00,
        image: "images/perfume4.jpg",
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
        message: 'Order placed successfully!'
    });
});

app.get('/api/orders', (req, res) => {
    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
    res.json(orders);
});

// Contact form
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE));
    const newMessage = {
        id: Date.now(),
        name,
        email,
        message, 
        date: new Date().toLocaleString()
    };
    
    messages.push(newMessage);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
    
    res.json({ success: true, message: 'Message sent successfully!' });
});

// Newsletter
app.post('/api/subscribe', (req, res) => {
    const { email } = req.body;
    
    const subscribers = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE));
    
    if (subscribers.find(s => s.email === email)) {
        return res.json({ success: false, message: 'Already subscribed' });
    }
    
    subscribers.push({ email, date: new Date().toLocaleString() });
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
    
    res.json({ success: true, message: 'Subscribed successfully!' });
});

// Serve pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 CLINCH Website running on port ${PORT}`);
    console.log(`👉 Visit: https://twongtde-p9ng.onrender.com`);
});