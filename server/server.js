const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
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

// Products data (enhanced with more details)
const products = [
    {
        id: 1,
        name: "Midnight Rose",
        description: "Luxurious floral fragrance with rose and musk notes that captivate the senses",
        price: 89.99,
        image: "/images/perfume1.jpg",
        category: "perfume",
        details: "A sophisticated blend of Bulgarian rose, white musk, and sandalwood. Perfect for evening events and special occasions.",
        ingredients: ["Bulgarian Rose", "White Musk", "Sandalwood", "Vanilla"],
        size: "100ml",
        featured: true
    },
    // ... more products with enhanced details
];

// API Routes
app.get('/api/products', (req, res) => {
    res.json(products);
});

app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

app.get('/api/featured', (req, res) => {
    const featured = products.filter(p => p.featured);
    res.json(featured);
});

// Contact form submission
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE));
    const newMessage = {
        id: Date.now(),
        name,
        email,
        message,
        date: new Date().toLocaleString(),
        read: false
    };
    
    messages.push(newMessage);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
    
    res.json({ success: true, message: 'Message sent successfully!' });
});

// Newsletter subscription
app.post('/api/subscribe', (req, res) => {
    const { email } = req.body;
    
    const subscribers = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE));
    
    if (subscribers.find(s => s.email === email)) {
        return res.json({ success: false, message: 'Email already subscribed' });
    }
    
    subscribers.push({
        email,
        date: new Date().toLocaleString()
    });
    
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
    res.json({ success: true, message: 'Successfully subscribed!' });
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

app.get('/product/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'product-detail.html'));
});

app.listen(PORT, () => {
    console.log(`🛍️  CLINCH Enhanced E-commerce running on port ${PORT}`);
});