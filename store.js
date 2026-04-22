/**
 * ═══════════════════════════════════════════════════
 *  Lune D'Or — In-Memory Data Store
 *  Replace with MongoDB/PostgreSQL in production
 * ═══════════════════════════════════════════════════
 */

// ── Products ──────────────────────────────────────
let products = [
  { id: 1,  name: "Oud Majesty",    price: 3200, category: "homme",      soldOut: false, img: "", createdAt: "2026-01-01T10:00:00Z" },
  { id: 2,  name: "Black Amber",    price: 2800, category: "homme",      soldOut: false, img: "", createdAt: "2026-01-02T10:00:00Z" },
  { id: 3,  name: "Desert King",    price: 3500, category: "homme",      soldOut: false, img: "", createdAt: "2026-01-03T10:00:00Z" },
  { id: 4,  name: "Sultan Noir",    price: 2600, category: "homme",      soldOut: true,  img: "", createdAt: "2026-01-04T10:00:00Z" },
  { id: 5,  name: "Rose Éternelle", price: 2900, category: "femme",      soldOut: false, img: "", createdAt: "2026-01-05T10:00:00Z" },
  { id: 6,  name: "Jasmin Doré",   price: 2500, category: "femme",      soldOut: false, img: "", createdAt: "2026-01-06T10:00:00Z" },
  { id: 7,  name: "Lune Blanche",  price: 3100, category: "femme",      soldOut: false, img: "", createdAt: "2026-01-07T10:00:00Z" },
  { id: 8,  name: "Velours Rose",  price: 2700, category: "femme",      soldOut: true,  img: "", createdAt: "2026-01-08T10:00:00Z" },
  { id: 9,  name: "Pack Royal",    price: 8500, category: "pack",        soldOut: false, img: "", createdAt: "2026-01-09T10:00:00Z" },
  { id: 10, name: "Shampooing Oud", price: 1200, category: "shampooing", soldOut: false, img: "", createdAt: "2026-01-10T10:00:00Z" },
];

// ── Orders ────────────────────────────────────────
let orders = [
  {
    id: 1, name: "Amira Benali", phone: "0793305740",
    wilaya: "16 - Alger", address: "Cité 400 logts, Bab Ezzouar",
    items: [{ productId: 1, name: "Oud Majesty", price: 3200, qty: 2 }],
    deliveryType: "domicile", deliveryFee: 400, subtotal: 6400, total: 6800,
    status: "pending", date: "2026-04-10T14:32:00Z", notes: ""
  },
  {
    id: 2, name: "Yacine Boudiaf", phone: "0661234567",
    wilaya: "25 - Constantine", address: "Rue Didouche Mourad, Centre-Ville",
    items: [{ productId: 5, name: "Rose Éternelle", price: 2900, qty: 1 }],
    deliveryType: "domicile", deliveryFee: 400, subtotal: 2900, total: 3300,
    status: "validated", date: "2026-04-11T09:15:00Z", notes: ""
  },
  {
    id: 3, name: "Sabrina Khelil", phone: "0770998877",
    wilaya: "31 - Oran", address: "Hai El Yasmine, Bir El Djir",
    items: [{ productId: 6, name: "Jasmin Doré", price: 2500, qty: 3 }],
    deliveryType: "bureau", deliveryFee: 400, subtotal: 7500, total: 7900,
    status: "pending", date: "2026-04-11T11:50:00Z", notes: ""
  },
  {
    id: 4, name: "Fouad Messaoudi", phone: "0555441122",
    wilaya: "07 - Biskra", address: "Avenue de la République, Biskra",
    items: [{ productId: 3, name: "Desert King", price: 3500, qty: 1 }],
    deliveryType: "domicile", deliveryFee: 600, subtotal: 3500, total: 4100,
    status: "delivered", date: "2026-04-12T08:00:00Z", notes: ""
  },
  {
    id: 5, name: "Nadia Ziani", phone: "0698776655",
    wilaya: "15 - Tizi Ouzou", address: "Village Aït Yahia, Chemini",
    items: [{ productId: 7, name: "Lune Blanche", price: 3100, qty: 2 }],
    deliveryType: "domicile", deliveryFee: 400, subtotal: 6200, total: 6600,
    status: "cancelled", date: "2026-04-12T16:22:00Z", notes: ""
  },
];

// ── Messages / Contact ────────────────────────────
let messages = [
  {
    id: 1, name: "Sarah M.", email: "sarah@gmail.com",
    message: "Les parfums sont vraiment magnifiques ! J'ai reçu Jasmin Doré et le packaging est tellement luxueux.",
    date: "2026-04-09T18:44:00Z", read: false
  },
  {
    id: 2, name: "Karim B.", email: "karim.b@hotmail.fr",
    message: "Service rapide et produit conforme. Je recommande Oud Majesty.",
    date: "2026-04-10T12:30:00Z", read: true
  },
  {
    id: 3, name: "Lynda O.", email: "lynda.o@gmail.com",
    message: "Lune Blanche est envoûtant. Livraison rapide à Alger, emballage soigné. Bravo !",
    date: "2026-04-11T20:15:00Z", read: false
  },
];

// ── Counters ──────────────────────────────────────
let nextProductId = products.length + 1;
let nextOrderId   = orders.length + 1;
let nextMessageId = messages.length + 1;

// ── Exported store ────────────────────────────────
module.exports = {
  // products
  getProducts:   ()  => [...products],
  getProductById: (id) => products.find(p => p.id === Number(id)),
  addProduct:    (p)  => {
    const newP = { ...p, id: nextProductId++, createdAt: new Date().toISOString() };
    products.push(newP);
    return newP;
  },
  updateProduct: (id, data) => {
    const idx = products.findIndex(p => p.id === Number(id));
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...data, id: Number(id) };
    return products[idx];
  },
  deleteProduct: (id) => {
    const idx = products.findIndex(p => p.id === Number(id));
    if (idx === -1) return false;
    products.splice(idx, 1);
    return true;
  },

  // orders
  getOrders:    ()  => [...orders],
  getOrderById: (id) => orders.find(o => o.id === Number(id)),
  addOrder:    (o)  => {
    const newO = { ...o, id: nextOrderId++, date: new Date().toISOString(), status: "pending" };
    orders.push(newO);
    return newO;
  },
  updateOrder: (id, data) => {
    const idx = orders.findIndex(o => o.id === Number(id));
    if (idx === -1) return null;
    orders[idx] = { ...orders[idx], ...data, id: Number(id) };
    return orders[idx];
  },
  deleteOrder: (id) => {
    const idx = orders.findIndex(o => o.id === Number(id));
    if (idx === -1) return false;
    orders.splice(idx, 1);
    return true;
  },

  // messages
  getMessages:    ()  => [...messages],
  getMessageById: (id) => messages.find(m => m.id === Number(id)),
  addMessage:    (m)  => {
    const newM = { ...m, id: nextMessageId++, date: new Date().toISOString(), read: false };
    messages.push(newM);
    return newM;
  },
  deleteMessage: (id) => {
    const idx = messages.findIndex(m => m.id === Number(id));
    if (idx === -1) return false;
    messages.splice(idx, 1);
    return true;
  },
  markMessageRead: (id) => {
    const m = messages.find(m => m.id === Number(id));
    if (!m) return null;
    m.read = true;
    return m;
  },

  // stats helper
  getStats: () => ({
    totalOrders:    orders.length,
    pendingOrders:  orders.filter(o => o.status === "pending").length,
    deliveredOrders: orders.filter(o => o.status === "delivered").length,
    cancelledOrders: orders.filter(o => o.status === "cancelled").length,
    totalRevenue:   orders
      .filter(o => o.status !== "cancelled")
      .reduce((s, o) => s + o.total, 0),
    totalProducts:  products.length,
    outOfStock:     products.filter(p => p.soldOut).length,
    unreadMessages: messages.filter(m => !m.read).length,
  }),
};
