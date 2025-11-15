const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware - Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes to serve CSS and JS files explicitly
app.get('/styles/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'styles', 'styles.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'script.js'));
});

app.get('/images/:imageName', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'images', req.params.imageName));
});

// ... rest of your API routes (orders, products, etc.) ...

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`CLINCH E-commerce running on port ${PORT}`);
});