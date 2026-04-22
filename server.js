/**
 * ╔══════════════════════════════════════════════════╗
 * ║         Lune D'Or — Express REST API             ║
 * ║         server.js  —  Entry point                ║
 * ╚══════════════════════════════════════════════════╝
 *
 *  PORT: 3000  (override via PORT env variable)
 *
 *  Base URL:  http://localhost:3000/api
 *
 *  ── Public endpoints (no auth) ──────────────────
 *  GET  /api                       API info
 *  GET  /api/products              List products
 *  GET  /api/products/:id          Single product
 *  GET  /api/delivery?wilaya=16    Delivery fees
 *  POST /api/orders                Place an order
 *  POST /api/messages              Send contact form
 *
 *  ── Protected endpoints (x-api-key header) ──────
 *  Header:  x-api-key: lunedor-admin-key-2026
 *         OR Authorization: Bearer lunedor-admin-key-2026
 *
 *  GET    /api/stats
 *  GET    /api/orders
 *  GET    /api/orders/:id
 *  PUT    /api/orders/:id
 *  PATCH  /api/orders/:id
 *  PATCH  /api/orders/:id/status
 *  DELETE /api/orders/:id
 *  POST   /api/products
 *  PUT    /api/products/:id
 *  PATCH  /api/products/:id
 *  PATCH  /api/products/:id/stock
 *  DELETE /api/products/:id
 *  GET    /api/messages
 *  GET    /api/messages/:id
 *  PATCH  /api/messages/:id/read
 *  DELETE /api/messages/:id
 */

const express = require("express");
const cors    = require("cors");

const { logger, errorHandler } = require("./middleware");
const productsRouter  = require("./routes/products");
const ordersRouter    = require("./routes/orders");
const messagesRouter  = require("./routes/messages");
const miscRouter      = require("./routes/misc");

const app  = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════
//  Global Middleware
// ═══════════════════════════════════════
app.use(cors({
  origin: "*",            // tighten in production to your frontend domain
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","x-api-key"],
}));

app.use(express.json({ limit: "5mb" }));   // parse JSON bodies (+ base64 images)
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// ═══════════════════════════════════════
//  API Root
// ═══════════════════════════════════════
app.get("/api", (_req, res) => {
  res.json({
    name:    "Lune D'Or REST API",
    version: "1.0.0",
    status:  "running",
    docs:    "See README.md for full endpoint reference",
    endpoints: {
      products: "/api/products",
      orders:   "/api/orders",
      messages: "/api/messages",
      stats:    "/api/stats  [🔒]",
      delivery: "/api/delivery?wilaya=16&type=domicile",
    },
  });
});

// ═══════════════════════════════════════
//  Mount Routers
// ═══════════════════════════════════════
app.use("/api/products", productsRouter);
app.use("/api/orders",   ordersRouter);
app.use("/api/messages", messagesRouter);
app.use("/api",          miscRouter);     // /api/stats  +  /api/delivery

// ═══════════════════════════════════════
//  404 fallback
// ═══════════════════════════════════════
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ═══════════════════════════════════════
//  Global error handler (must be last)
// ═══════════════════════════════════════
app.use(errorHandler);

// ═══════════════════════════════════════
//  Start
// ═══════════════════════════════════════
app.listen(PORT, () => {
  console.log("╔══════════════════════════════════════╗");
  console.log(`║  🌙 Lune D'Or API started            ║`);
  console.log(`║  http://localhost:${PORT}/api           ║`);
  console.log("╚══════════════════════════════════════╝");
});

module.exports = app; // for testing
