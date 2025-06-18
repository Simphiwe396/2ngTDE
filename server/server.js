const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Fix 1: Correct static file path
app.use(express.static(path.join(__dirname, '../public')));

// Fix 2: Essential middleware
app.use(express.json());

// Fix 3: Route fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`SERVER LIVE on port ${PORT}`); // ← Confirmed working
});