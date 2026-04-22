/**
 * ═══════════════════════════════════════════════════
 *  Lune D'Or — /api/messages  Router
 * ═══════════════════════════════════════════════════
 *
 *  GET    /api/messages          → list all [🔒]
 *  GET    /api/messages/:id      → get one  [🔒]
 *  POST   /api/messages          → send contact form (public)
 *  DELETE /api/messages/:id      → delete   [🔒]
 *  PATCH  /api/messages/:id/read → mark read [🔒]
 */

const router      = require("express").Router();
const store       = require("../data/store");
const { respond, requireAuth, validators } = require("../middleware");

// ── GET /api/messages ─────────────────────────────
router.get("/", requireAuth, (req, res) => {
  let data = store.getMessages();
  // Filter by read status (?read=true|false)
  if (req.query.read !== undefined) {
    const flag = req.query.read === "true";
    data = data.filter(m => m.read === flag);
  }
  // Sort newest first
  data.sort((a, b) => new Date(b.date) - new Date(a.date));
  respond.ok(res, data, { count: data.length });
});

// ── GET /api/messages/:id ─────────────────────────
router.get("/:id", requireAuth, (req, res) => {
  const msg = store.getMessageById(req.params.id);
  if (!msg) return respond.notFound(res, `Message #${req.params.id} not found`);
  respond.ok(res, msg);
});

// ── POST /api/messages  (public — contact form) ───
router.post("/", (req, res) => {
  const errors = validators.message(req.body);
  if (errors.length) return respond.badReq(res, errors.join(" | "));

  const { name, email, message } = req.body;
  const created = store.addMessage({ name, email, message });
  respond.created(res, created);
});

// ── DELETE /api/messages/:id ──────────────────────
router.delete("/:id", requireAuth, (req, res) => {
  const existing = store.getMessageById(req.params.id);
  if (!existing) return respond.notFound(res, `Message #${req.params.id} not found`);

  store.deleteMessage(req.params.id);
  respond.ok(res, { id: Number(req.params.id), deleted: true });
});

// ── PATCH /api/messages/:id/read ─────────────────
router.patch("/:id/read", requireAuth, (req, res) => {
  const msg = store.markMessageRead(req.params.id);
  if (!msg) return respond.notFound(res, `Message #${req.params.id} not found`);
  respond.ok(res, msg);
});

module.exports = router;
