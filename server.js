const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

// ⭐ FIX — serve your static files
app.use(express.static("public"));

// your API routes here...

// ⭐ MUST be at the bottom
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(process.env.PORT || 10000, () =>
    console.log("Server running on", process.env.PORT || 10000)
);
