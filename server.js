/**
 * ╔══════════════════════════════════════════════════╗
 * ║         Lune D'Or — Express REST API             ║
 * ║         server.js  —  Entry point                ║
 * ╚══════════════════════════════════════════════════╝
 */

const express = require("express");
const cors    = require("cors");
const path    = require("path");

// T'akked belli hadou les fichiers rahom f blast'hom dakhil folders: routes w middleware
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
  origin: "*", 
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","x-api-key"],
}));

app.use(express.json({ limit: "5mb" })); 
app.use(express.urlencoded({ extended: true }));

// Ila el-site mazal ydir error 500, siyye commenti had el-ster (// app.use(logger))
app.use(logger);

// ═══════════════════════════════════════
//  API Root
// ═══════════════════════════════════════
app.get("/api", (_req, res) => {
  res.json({
    name:     "Lune D'Or REST API",
    version: "1.0.0",
    status:  "running",
    endpoints: {
      products: "/api/products",
      orders:   "/api/orders",
      messages: "/api/messages",
    },
  });
});

// ═══════════════════════════════════════
//  Mount Routers
// ═══════════════════════════════════════
app.use("/api/products", productsRouter);
app.use("/api/orders",   ordersRouter);
app.use("/api/messages", messagesRouter);
app.use("/api",          miscRouter); 

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
//  Start (Vercel uses module.exports)
// ═══════════════════════════════════════
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;