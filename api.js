/**
 * ╔══════════════════════════════════════════════════╗
 * ║         Lune D'Or — API Client (api.js)          ║
 * ║  Drop this file into the same folder as          ║
 * ║  index.html and replace the localStorage calls   ║
 * ╚══════════════════════════════════════════════════╝
 *
 *  Usage:
 *    <script src="api.js"></script>
 *    Then call window.LuneAPI.* from your code.
 *
 *  Admin key goes in: LuneAPI.setAdminKey("lunedor-admin-key-2026")
 */

const LuneAPI = (() => {
  // ── Config ───────────────────────────────────────
  const BASE_URL  = "http://localhost:3000/api";
  let   _adminKey = "";

  // ── Core fetch wrapper ───────────────────────────
  async function _req(method, path, body, auth = false) {
    const headers = { "Content-Type": "application/json" };
    if (auth && _adminKey) headers["x-api-key"] = _adminKey;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res  = await fetch(`${BASE_URL}${path}`, opts);
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = json.error || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return json;  // { success, data, count? }
  }

  // ── Public API ───────────────────────────────────
  return {

    /** Set admin API key (call this after user logs in) */
    setAdminKey: (key) => { _adminKey = key; },
    clearAdminKey: ()  => { _adminKey = ""; },

    // ── Products ─────────────────────────────────

    /** GET all products. opts: { category, soldOut, sort } */
    getProducts: (opts = {}) => {
      const q = new URLSearchParams(opts).toString();
      return _req("GET", `/products${q ? "?" + q : ""}`);
    },

    /** GET single product by id */
    getProduct: (id) => _req("GET", `/products/${id}`),

    /** POST create product [admin] */
    createProduct: (data) => _req("POST", "/products", data, true),

    /** PUT replace product [admin] */
    replaceProduct: (id, data) => _req("PUT", `/products/${id}`, data, true),

    /** PATCH partial update product [admin] */
    updateProduct: (id, data) => _req("PATCH", `/products/${id}`, data, true),

    /** DELETE product [admin] */
    deleteProduct: (id) => _req("DELETE", `/products/${id}`, null, true),

    /** PATCH toggle soldOut status [admin] */
    toggleStock: (id) => _req("PATCH", `/products/${id}/stock`, null, true),

    // ── Orders ───────────────────────────────────

    /** GET all orders [admin]. opts: { status, wilaya, phone } */
    getOrders: (opts = {}) => {
      const q = new URLSearchParams(opts).toString();
      return _req("GET", `/orders${q ? "?" + q : ""}`, null, true);
    },

    /** GET single order [admin] */
    getOrder: (id) => _req("GET", `/orders/${id}`, null, true),

    /**
     * POST place a new order (public — customer checkout).
     * @param {Object} order
     * @param {string} order.name
     * @param {string} order.phone
     * @param {string} order.wilaya        — e.g. "16 - Alger"
     * @param {string} order.address
     * @param {Array}  order.items         — [{ productId, qty }, ...]
     * @param {string} order.deliveryType  — "domicile" | "bureau"
     * @param {number} order.deliveryFee
     * @param {string} [order.notes]
     */
    placeOrder: (order) => _req("POST", "/orders", order),

    /** PUT replace order [admin] */
    replaceOrder: (id, data) => _req("PUT", `/orders/${id}`, data, true),

    /** PATCH partial update order [admin] */
    updateOrder: (id, data) => _req("PATCH", `/orders/${id}`, data, true),

    /** PATCH change order status [admin]. status: pending|validated|delivered|cancelled */
    setOrderStatus: (id, status) =>
      _req("PATCH", `/orders/${id}/status`, { status }, true),

    /** DELETE order [admin] */
    deleteOrder: (id) => _req("DELETE", `/orders/${id}`, null, true),

    // ── Messages ─────────────────────────────────

    /** GET all messages [admin]. opts: { read } */
    getMessages: (opts = {}) => {
      const q = new URLSearchParams(opts).toString();
      return _req("GET", `/messages${q ? "?" + q : ""}`, null, true);
    },

    /** GET single message [admin] */
    getMessage: (id) => _req("GET", `/messages/${id}`, null, true),

    /**
     * POST send contact form (public).
     * @param {{ name, email, message }} msg
     */
    sendMessage: (msg) => _req("POST", "/messages", msg),

    /** PATCH mark message as read [admin] */
    markRead: (id) => _req("PATCH", `/messages/${id}/read`, null, true),

    /** DELETE message [admin] */
    deleteMessage: (id) => _req("DELETE", `/messages/${id}`, null, true),

    // ── Misc ─────────────────────────────────────

    /** GET dashboard statistics [admin] */
    getStats: () => _req("GET", "/stats", null, true),

    /**
     * GET delivery fee for a wilaya.
     * @param {number|string} wilaya  — wilaya number (1-58)
     * @param {"domicile"|"bureau"} type
     */
    getDeliveryFee: (wilaya, type = "domicile") =>
      _req("GET", `/delivery?wilaya=${wilaya}&type=${type}`),
  };
})();

// Make available globally in browser
if (typeof window !== "undefined") window.LuneAPI = LuneAPI;

// CommonJS export for Node test files
if (typeof module !== "undefined") module.exports = LuneAPI;
