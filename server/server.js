const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, '../public')));

// Sample data - in a real app, this would be in a database
let products = [
    {
        id: 1,
        name: "Premium T-Shirt",
        price: 249.99,
        image: "images/products/tshirt.jpg",
        rating: 4.5,
        badge: "Bestseller"
    },
    // ... other products
];

let orders = [];
let users = [
    // Admin users
    { id: 1, username: "simphiwe", password: "shareholder123", role: "shareholder", name: "Simphiwe Kubheka" },
    { id: 2, username: "nqobile", password: "shareholder456", role: "shareholder", name: "Nqobile Kubheka" },
    { id: 3, username: "themba", password: "founder789", role: "founder", name: "Themba Kubheka" },
    { id: 4, username: "beauty", password: "ceo123", role: "ceo", name: "Beauty Kubheka" },
    { id: 5, username: "lindiwe", password: "manager456", role: "manager", name: "Lindiwe Tshabalala" },
    { id: 6, username: "silindile", password: "admin789", role: "admin", name: "Silindile Kubheka" }
];

// API Routes
// Get all products
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).send('Product not found');
    res.json(product);
});

// Create new order
app.post('/api/orders', (req, res) => {
    const order = {
        id: orders.length + 1,
        date: new Date(),
        products: req.body.products,
        customer: req.body.customer,
        status: "Processing"
    };
    orders.push(order);
    res.status(201).json(order);
});

// Admin login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // In a real app, you would use JWT or sessions
    res.json({
        id: user.id,
        name: user.name,
        role: user.role
    });
});

// Get all orders (admin only)
app.get('/api/admin/orders', (req, res) => {
    // In a real app, you would verify admin status
    res.json(orders);
});

// Update order status (admin only)
app.put('/api/admin/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (!order) return res.status(404).send('Order not found');
    
    order.status = req.body.status;
    res.json(order);
});

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(Server running on port ${PORT});  // Fixed: Added backticks
});