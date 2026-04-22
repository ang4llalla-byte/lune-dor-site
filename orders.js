/**
 * ═══════════════════════════════════════════════════
 *  Lune D'Or — /api/orders  Router
 * ═══════════════════════════════════════════════════
 *
 *  GET    /api/orders              → list all [🔒] (supports ?status=&wilaya=)
 *  GET    /api/orders/:id          → get one  [🔒]
 *  POST   /api/orders              → create (public — customer checkout)
 *  PUT    /api/orders/:id          → full replace [🔒]
 *  PATCH  /api/orders/:id          → partial update [🔒]
 *  DELETE /api/orders/:id          → remove  [🔒]
 *  PATCH  /api/orders/:id/status   → change status [🔒]
 */

const router      = require("express").Router();
const store       = require("../data/store");
const { respond, requireAuth, validators } = require("../middleware");

const VALID_STATUSES = ["pending", "validated", "delivered", "cancelled"];

// ── GET /api/orders ───────────────────────────────
router.get("/", requireAuth, (req, res) => {
  let data = store.getOrders();

  // Filter
  if (req.query.status) {
    data = data.filter(o => o.status === req.query.status);
  }
  if (req.query.wilaya) {
    data = data.filter(o => o.wilaya.toLowerCase().includes(req.query.wilaya.toLowerCase()));
  }
  if (req.query.phone) {
    data = data.filter(o => o.phone.includes(req.query.phone));
  }

  // Sort newest first by default
  data.sort((a, b) => new Date(b.date) - new Date(a.date));

  respond.ok(res, data, { count: data.length });
});

// ── GET /api/orders/:id ───────────────────────────
router.get("/:id", requireAuth, (req, res) => {
  const order = store.getOrderById(req.params.id);
  if (!order) return respond.notFound(res, `Order #${req.params.id} not found`);
  respond.ok(res, order);
});

// ── POST /api/orders  (public — customer checkout) ─
router.post("/", (req, res) => {
  const errors = validators.order(req.body);
  if (errors.length) return respond.badReq(res, errors.join(" | "));

  const { name, phone, wilaya, address, items, deliveryType, deliveryFee, notes = "" } = req.body;

  // Validate items exist & are in stock
  for (const item of items) {
    const product = store.getProductById(item.productId);
    if (!product)         return respond.badReq(res, `Product #${item.productId} not found`);
    if (product.soldOut)  return respond.badReq(res, `Product "${product.name}" is out of stock`);
    if (!item.qty || item.qty < 1) return respond.badReq(res, `Invalid qty for product #${item.productId}`);
  }

  // Compute totals server-side (never trust client totals for money)
  const enrichedItems = items.map(item => {
    const product = store.getProductById(item.productId);
    return {
      productId: item.productId,
      name:      product.name,
      price:     product.price,
      qty:       item.qty,
      lineTotal: product.price * item.qty,
    };
  });
  const subtotal = enrichedItems.reduce((s, i) => s + i.lineTotal, 0);
  const total    = subtotal + Number(deliveryFee);

  const order = store.addOrder({
    name, phone, wilaya, address,
    items: enrichedItems,
    deliveryType,
    deliveryFee: Number(deliveryFee),
    subtotal,
    total,
    notes,
  });
  respond.created(res, order);
});

// ── PUT /api/orders/:id ───────────────────────────
router.put("/:id", requireAuth, (req, res) => {
  const existing = store.getOrderById(req.params.id);
  if (!existing) return respond.notFound(res, `Order #${req.params.id} not found`);

  const errors = validators.order(req.body);
  if (errors.length) return respond.badReq(res, errors.join(" | "));

  const updated = store.updateOrder(req.params.id, req.body);
  respond.ok(res, updated);
});

// ── PATCH /api/orders/:id ─────────────────────────
router.patch("/:id", requireAuth, (req, res) => {
  const existing = store.getOrderById(req.params.id);
  if (!existing) return respond.notFound(res, `Order #${req.params.id} not found`);

  const allowed = ["name","phone","wilaya","address","notes","deliveryType","deliveryFee"];
  const patch   = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) patch[k] = req.body[k]; });

  const updated = store.updateOrder(req.params.id, patch);
  respond.ok(res, updated);
});

// ── DELETE /api/orders/:id ────────────────────────
router.delete("/:id", requireAuth, (req, res) => {
  const existing = store.getOrderById(req.params.id);
  if (!existing) return respond.notFound(res, `Order #${req.params.id} not found`);

  store.deleteOrder(req.params.id);
  respond.ok(res, { id: Number(req.params.id), deleted: true });
});

// ── PATCH /api/orders/:id/status ──────────────────
router.patch("/:id/status", requireAuth, (req, res) => {
  const order = store.getOrderById(req.params.id);
  if (!order) return respond.notFound(res, `Order #${req.params.id} not found`);

  const { status } = req.body;
  if (!status || !VALID_STATUSES.includes(status)) {
    return respond.badReq(res, `status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  // Business rule: can't re-open a delivered order
  if (order.status === "delivered" && status !== "delivered") {
    return respond.badReq(res, "Cannot change status of an already delivered order");
  }

  const updated = store.updateOrder(req.params.id, { status });
  respond.ok(res, updated);
});

module.exports = router;
