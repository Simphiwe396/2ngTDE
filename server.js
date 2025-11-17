import express from "express";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files
app.use(express.static("public"));

// MongoDB connection (ONLY for orders)
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Mongo connection error", err));
}

// Order Schema
const orderSchema = new mongoose.Schema({
  items: Array,
  name: String,
  phone: String,
  address: String,
  city: String,
  total: Number,
  status: {
    type: String,
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);

/* =======================================================
   ✅ ALWAYS LOAD PRODUCTS FROM products.json (NOT MongoDB)
   ======================================================= */
app.get("/api/products", (req, res) => {
  try {
    const file = path.join(process.cwd(), "public", "products.json");

    if (!fs.existsSync(file)) {
      console.log("products.json missing!");
      return res.json([]);
    }

    const raw = fs.readFileSync(file, "utf8");
    const json = JSON.parse(raw);

    return res.json(json.products || json);
  } catch (err) {
    console.error("Failed to load products.json:", err);
    return res.json([]);
  }
});

/* =======================================================
   ➕ Save order
   ======================================================= */
app.post("/api/order", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();

    res.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error("Order save failed", err);
    res.status(500).json({ success: false });
  }
});

/* =======================================================
   ➕ Track order
   ======================================================= */
app.get("/api/track/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.json({ error: "Order not found" });

    res.json(order);
  } catch (err) {
    res.json({ error: "Invalid tracking ID" });
  }
});

/* =======================================================
   PayFast redirect handler (front-end handles payment)
   ======================================================= */
app.post("/api/payfast/return", (req, res) => {
  res.redirect("/success.html");
});
app.post("/api/payfast/cancel", (req, res) => {
  res.redirect("/cancel.html");
});

/* =======================================================
   Serve website
   ======================================================= */
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

/* =======================================================
   Start Server
   ======================================================= */
const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Server running on port ${port}`));
