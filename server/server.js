const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Orders storage
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Initialize orders file if it doesn't exist
if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
}

// Helper function to read orders
function readOrders() {
    try {
        const data = fs.readFileSync(ORDERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Helper function to write orders
function writeOrders(orders) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

// API Routes
// Get all products
app.get('/api/products', (req, res) => {
    const products = [
        {
            id: 1,
            name: "Signature Elegance",
            description: "Evening Gown & Perfume Set",
            price: 189.00,
            image: "images/product1.jpg",
            category: "set"
        },
        {
            id: 2,
            name: "Morning Dew",
            description: "Fresh Floral Fragrance",
            price: 89.00,
            image: "images/product2.jpg",
            category: "perfume"
        },
        {
            id: 3,
            name: "Timeless Classic",
            description: "Wool Blend Coat",
            price: 156.00,
            image: "images/product3.jpg",
            category: "clothing"
        },
        {
            id: 4,
            name: "Mystic Woods",
            description: "Oriental Perfume",
            price: 95.00,
            image: "images/product1.jpg",
            category: "perfume"
        },
        {
            id: 5,
            name: "Silk Elegance",
            description: "Day-to-Night Dress",
            price: 134.00,
            image: "images/product2.jpg",
            category: "clothing"
        },
        {
            id: 6,
            name: "Citrus Bloom",
            description: "Fresh Summer Scent",
            price: 78.00,
            image: "images/product3.jpg",
            category: "perfume"
        }
    ];
    res.json(products);
});

// Submit new order
app.post('/api/orders', (req, res) => {
    const { customer, items, total, email, phone } = req.body;
    
    const orders = readOrders();
    const newOrder = {
        id: Date.now(),
        customer,
        email,
        phone,
        items,
        total,
        status: 'pending',
        date: new Date().toISOString()
    };
    
    orders.push(newOrder);
    writeOrders(orders);
    
    res.json({ 
        success: true, 
        message: 'Order placed successfully!', 
        orderId: newOrder.id 
    });
});

// Get all orders (for admin)
app.get('/api/orders', (req, res) => {
    const orders = readOrders();
    res.json(orders);
});

// Update order status
app.put('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const orders = readOrders();
    const orderIndex = orders.findIndex(order => order.id == id);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = status;
        writeOrders(orders);
        res.json({ success: true, message: 'Order updated' });
    } else {
        res.status(404).json({ success: false, message: 'Order not found' });
    }
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`CLINCH E-commerce running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});