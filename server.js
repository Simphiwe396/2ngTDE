const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

// Serve static files from root directory
app.use(express.static(__dirname));
app.use(express.json());

// API routes
app.get('/api/products', (req, res) => {
    const products = [
        {
            id: 1,
            name: "Midnight Rose",
            price: 89.99,
            description: "Luxurious floral fragrance with notes of Bulgarian rose, jasmine, and vanilla",
            category: "Floral",
            images: ["midnight-rose-1.jpg", "midnight-rose-2.jpg"],
            features: ["Long-lasting", "Evening wear", "Romantic"]
        },
        {
            id: 2,
            name: "Ocean Breeze",
            price: 75.50,
            description: "Fresh aquatic scent inspired by coastal waves and sea salt",
            category: "Aquatic",
            images: ["ocean-breeze-1.jpg", "ocean-breeze-2.jpg"],
            features: ["Refreshing", "Day wear", "Summer scent"]
        },
        {
            id: 3,
            name: "Vanilla Dream",
            price: 82.00,
            description: "Warm vanilla fragrance with hints of amber and tonka bean",
            category: "Oriental",
            images: ["vanilla-dream-1.jpg", "vanilla-dream-2.jpg"],
            features: ["Warm", "Comforting", "All-season"]
        },
        {
            id: 4,
            name: "Citrus Zest",
            price: 65.00,
            description: "Energetic citrus scent with bergamot, lemon, and grapefruit",
            category: "Citrus",
            images: ["citrus-zest-1.jpg", "citrus-zest-2.jpg"],
            features: ["Energizing", "Morning wear", "Unisex"]
        },
        {
            id: 5,
            name: "Noir Essence",
            price: 120.00,
            description: "Mysterious blend of oud, leather, and smoky notes",
            category: "Woody",
            images: ["noir-essence-1.jpg", "noir-essence-2.jpg"],
            features: ["Mysterious", "Evening wear", "Luxury"]
        },
        {
            id: 6,
            name: "Royal Amber",
            price: 95.00,
            description: "Rich amber fragrance with spices and precious woods",
            category: "Oriental",
            images: ["royal-amber-1.jpg", "royal-amber-2.jpg"],
            features: ["Royal", "Winter scent", "Elegant"]
        }
    ];
    res.json(products);
});

// Serve main pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/product/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'product.html'));
});

app.get('/collections', (req, res) => {
    res.sendFile(path.join(__dirname, 'collections.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

// Handle order submission
app.post('/api/orders', (req, res) => {
    const order = req.body;
    // In a real app, save to database
    console.log('New order received:', order);
    res.json({ 
        success: true, 
        orderId: 'CLINCH-' + Date.now(),
        message: 'Order placed successfully!' 
    });
});

app.listen(PORT, () => {
    console.log(`🛍️ CLINCH Perfume Store running on port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
});