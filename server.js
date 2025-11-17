import express from "express";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve static public folder
app.use(express.static("public"));

// Connect to MongoDB
if (process.env.MONGO_URI) {
    mongoose
        .connect(process.env.MONGO_URI)
        .then(() => console.log("Connected to MongoDB"))
        .catch((err) => console.error("MongoDB Error:", err));
}

// ======= ROUTES (PayFast, Admin, API, etc.) =======
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

// Fallback for frontend pages
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
