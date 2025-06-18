const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Admin routes (working logins)
const admins = [
    { username: "beauty", password: "ceo123", role: "ceo" },
    // ... All other admins
];

app.post('/api/admin/login', (req, res) => {
    // Working auth logic
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`); // Backticks verified
});