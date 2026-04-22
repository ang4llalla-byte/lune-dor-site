/**
 * ═══════════════════════════════════════════════════
 *  Lune D'Or — /api/products  Router
 * ═══════════════════════════════════════════════════
 *
 *  GET    /api/products            → list all (supports ?category=&soldOut=)
 *  GET    /api/products/:id        → get one
 *  POST   /api/products            → create  [🔒 admin]
 *  PUT    /api/products/:id        → replace [🔒 admin]
 *  PATCH  /api/products/:id        → partial [🔒 admin]
 *  DELETE /api/products/:id        → remove  [🔒 admin]
 *  PATCH  /api/products/:id/stock  → toggle soldOut [🔒 admin]
 */

const router      = require("express").Router();
const store       = require("../data/store");
const { respond, requireAuth, validators } = require("../middleware");

// ── GET /api/products ──────────────────────────────
router.get("/", (req, res) => {
  let data = store.getProducts();

  // Filter by category
  if (req.query.category) {
    data = data.filter(p => p.category === req.query.category);
  }
  // Filter by stock status  (?soldOut=true|false)
  if (req.query.soldOut !== undefined) {
    const flag = req.query.soldOut === "true";
    data = data.filter(p => p.soldOut === flag);
  }
  // Sort  (?sort=price_asc | price_desc | name_asc)
  if (req.query.sort === "price_asc")  data.sort((a, b) => a.price - b.price);
  if (req.query.sort === "price_desc") data.sort((a, b) => b.price - a.price);
  if (req.query.sort === "name_asc")   data.sort((a, b) => a.name.localeCompare(b.name));

  respond.ok(res, data, { count: data.length });
});

// ── GET /api/products/:id ─────────────────────────
router.get("/:id", (req, res) => {
  const product = store.getProductById(req.params.id);
  if (!product) return respond.notFound(res, `Product #${req.params.id} not found`);
  respond.ok(res, product);
});

// ── POST /api/products ────────────────────────────
router.post("/", requireAuth, (req, res) => {
  const errors = validators.product(req.body);
  if (errors.length) return respond.badReq(res, errors.join(" | "));

  const { name, price, category, soldOut = false, img = "" } = req.body;
  const product = store.addProduct({ name, price: Number(price), category, soldOut, img });
  respond.created(res, product);
});

// ── PUT /api/products/:id ─────────────────────────
router.put("/:id", requireAuth, (req, res) => {
  const existing = store.getProductById(req.params.id);
  if (!existing) return respond.notFound(res, `Product #${req.params.id} not found`);

  const errors = validators.product(req.body);
  if (errors.length) return respond.badReq(res, errors.join(" | "));

  const { name, price, category, soldOut, img } = req.body;
  const updated = store.updateProduct(req.params.id, {
    name, price: Number(price), category,
    soldOut: soldOut ?? existing.soldOut,
    img: img ?? existing.img,
  });
  respond.ok(res, updated);
});

// ── PATCH /api/products/:id ───────────────────────
router.patch("/:id", requireAuth, (req, res) => {
  const existing = store.getProductById(req.params.id);
  if (!existing) return respond.notFound(res, `Product #${req.params.id} not found`);

  const allowed = ["name", "price", "category", "soldOut", "img"];
  const patch   = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) patch[k] = req.body[k]; });
  if (patch.price) patch.price = Number(patch.price);

  const updated = store.updateProduct(req.params.id, patch);
  respond.ok(res, updated);
});

// ── DELETE /api/products/:id ──────────────────────
router.delete("/:id", requireAuth, (req, res) => {
  const existing = store.getProductById(req.params.id);
  if (!existing) return respond.notFound(res, `Product #${req.params.id} not found`);

  store.deleteProduct(req.params.id);
  respond.ok(res, { id: Number(req.params.id), deleted: true });
});

// ── PATCH /api/products/:id/stock ─────────────────
router.patch("/:id/stock", requireAuth, (req, res) => {
  const product = store.getProductById(req.params.id);
  if (!product) return respond.notFound(res, `Product #${req.params.id} not found`);

  const updated = store.updateProduct(req.params.id, { soldOut: !product.soldOut });
  respond.ok(res, updated);
});

module.exports = router;
