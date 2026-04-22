/**
 * ═══════════════════════════════════════════════════
 *  Lune D'Or — Middleware
 * ═══════════════════════════════════════════════════
 */

// ── Standardised JSON response helpers ────────────
const respond = {
  ok:      (res, data, meta = {})  => res.status(200).json({ success: true,  data, ...meta }),
  created: (res, data)             => res.status(201).json({ success: true,  data }),
  noContent:(res)                  => res.status(204).send(),
  notFound:(res, msg = "Not found")=> res.status(404).json({ success: false, error: msg }),
  badReq:  (res, msg = "Bad request")=> res.status(400).json({ success: false, error: msg }),
  unauth:  (res, msg = "Unauthorized")=> res.status(401).json({ success: false, error: msg }),
  serverErr:(res, msg = "Internal server error") => res.status(500).json({ success: false, error: msg }),
};

// ── Simple API-key auth ────────────────────────────
// In production: use JWT (jsonwebtoken) and hashed secrets
const ADMIN_KEY = "lunedor-admin-key-2026";

const requireAuth = (req, res, next) => {
  const key =
    req.headers["x-api-key"] ||
    req.headers["authorization"]?.replace("Bearer ", "");
  if (key !== ADMIN_KEY) return respond.unauth(res, "Valid API key required");
  next();
};

// ── Request logger ─────────────────────────────────
const logger = (req, _res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}]  ${req.method.padEnd(7)} ${req.originalUrl}`);
  next();
};

// ── Global error handler (attach last) ────────────
const errorHandler = (err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);
  respond.serverErr(res, err.message || "Unexpected error");
};

// ── Input validators ───────────────────────────────
const validators = {
  product: (body) => {
    const errors = [];
    if (!body.name   || typeof body.name !== "string")      errors.push("name is required (string)");
    if (!body.price  || isNaN(Number(body.price)))          errors.push("price is required (number)");
    if (Number(body.price) <= 0)                            errors.push("price must be > 0");
    const CATS = ["homme", "femme", "shampooing", "pack", "tous"];
    if (!body.category || !CATS.includes(body.category))   errors.push(`category must be one of: ${CATS.join(", ")}`);
    return errors;
  },
  order: (body) => {
    const errors = [];
    if (!body.name    || typeof body.name !== "string")     errors.push("name is required");
    if (!body.phone   || typeof body.phone !== "string")    errors.push("phone is required");
    if (!body.wilaya  || typeof body.wilaya !== "string")   errors.push("wilaya is required");
    if (!body.address || typeof body.address !== "string")  errors.push("address is required");
    if (!Array.isArray(body.items) || !body.items.length)   errors.push("items[] must be a non-empty array");
    if (!["domicile","bureau"].includes(body.deliveryType)) errors.push("deliveryType must be 'domicile' or 'bureau'");
    if (isNaN(Number(body.deliveryFee)))                    errors.push("deliveryFee is required (number)");
    return errors;
  },
  message: (body) => {
    const errors = [];
    if (!body.name    || typeof body.name !== "string")     errors.push("name is required");
    if (!body.email   || !body.email.includes("@"))         errors.push("valid email is required");
    if (!body.message || typeof body.message !== "string")  errors.push("message is required");
    return errors;
  },
};

module.exports = { respond, requireAuth, logger, errorHandler, validators };
