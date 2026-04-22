# 🌙 Lune D'Or — REST API

Express.js backend for the Lune D'Or perfumery e-commerce site.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start          # production
npm run dev        # with auto-reload (nodemon)
```

Server runs at: **`http://localhost:3000`**

---

## Project Structure

```
lunedor-api/
├── src/
│   ├── server.js           ← Entry point (Express app)
│   ├── data/
│   │   └── store.js        ← In-memory data store (swap with DB)
│   ├── middleware/
│   │   └── index.js        ← Auth, logger, validators, responders
│   └── routes/
│       ├── products.js     ← /api/products
│       ├── orders.js       ← /api/orders
│       ├── messages.js     ← /api/messages
│       └── misc.js         ← /api/stats  /api/delivery
├── api.js                  ← JS client (include in your HTML)
└── package.json
```

---

## Authentication

Protected routes require an API key in the request header:

```
x-api-key: lunedor-admin-key-2026
```
or
```
Authorization: Bearer lunedor-admin-key-2026
```

> In production: replace with JWT tokens and bcrypt-hashed passwords.

---

## Endpoint Reference

### Base URL: `http://localhost:3000/api`

---

### 🔓 Public Endpoints (no auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info & health check |
| GET | `/products` | List all products |
| GET | `/products/:id` | Get single product |
| GET | `/delivery` | Get delivery fee |
| POST | `/orders` | Place a new order |
| POST | `/messages` | Send contact form |

---

### 🔒 Admin Endpoints (require x-api-key)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Dashboard statistics |
| GET | `/orders` | List all orders |
| GET | `/orders/:id` | Get single order |
| PUT | `/orders/:id` | Replace order |
| PATCH | `/orders/:id` | Partial update |
| PATCH | `/orders/:id/status` | Update order status |
| DELETE | `/orders/:id` | Delete order |
| POST | `/products` | Create product |
| PUT | `/products/:id` | Replace product |
| PATCH | `/products/:id` | Partial update |
| PATCH | `/products/:id/stock` | Toggle soldOut |
| DELETE | `/products/:id` | Delete product |
| GET | `/messages` | List messages |
| GET | `/messages/:id` | Get single message |
| PATCH | `/messages/:id/read` | Mark as read |
| DELETE | `/messages/:id` | Delete message |

---

## Detailed Examples

### Products

#### GET /api/products
```
GET /api/products
GET /api/products?category=femme
GET /api/products?soldOut=false
GET /api/products?sort=price_asc
```
Response:
```json
{
  "success": true,
  "count": 10,
  "data": [
    { "id": 1, "name": "Oud Majesty", "price": 3200,
      "category": "homme", "soldOut": false, "img": "" }
  ]
}
```

#### POST /api/products  🔒
```json
{
  "name": "Minuit Bleu",
  "price": 3400,
  "category": "femme",
  "soldOut": false,
  "img": ""
}
```

#### PATCH /api/products/1  🔒
```json
{ "price": 3500 }
```

#### PATCH /api/products/4/stock  🔒
Toggles `soldOut` → no body required.

---

### Orders

#### POST /api/orders  (customer checkout)
```json
{
  "name": "Amira Benali",
  "phone": "0793305740",
  "wilaya": "16 - Alger",
  "address": "Cité 400 logts, Bab Ezzouar",
  "items": [
    { "productId": 1, "qty": 2 },
    { "productId": 6, "qty": 1 }
  ],
  "deliveryType": "domicile",
  "deliveryFee": 400,
  "notes": ""
}
```
> Prices are computed server-side — clients cannot fake totals.

#### PATCH /api/orders/2/status  🔒
```json
{ "status": "validated" }
```
Valid statuses: `pending` → `validated` → `delivered` | `cancelled`

#### GET /api/orders  🔒
```
GET /api/orders
GET /api/orders?status=pending
GET /api/orders?wilaya=Alger
GET /api/orders?phone=0793
```

---

### Messages

#### POST /api/messages  (contact form)
```json
{
  "name": "Sarah M.",
  "email": "sarah@gmail.com",
  "message": "Bonjour, je voudrais commander en gros."
}
```

---

### Delivery Fee

```
GET /api/delivery?wilaya=16&type=domicile
GET /api/delivery?wilaya=31&type=bureau
```
Response:
```json
{
  "success": true,
  "data": {
    "wilaya": 16,
    "zone": 1,
    "domicile": 750,
    "bureau": 350,
    "selected": 750,
    "selectedType": "domicile"
  }
}
```

---

### Stats

```
GET /api/stats
Header: x-api-key: lunedor-admin-key-2026
```
Response:
```json
{
  "success": true,
  "data": {
    "totalOrders": 5,
    "pendingOrders": 2,
    "deliveredOrders": 1,
    "cancelledOrders": 1,
    "totalRevenue": 21700,
    "totalProducts": 10,
    "outOfStock": 2,
    "unreadMessages": 2
  }
}
```

---

## Using the JS Client (api.js)

Add to your HTML:
```html
<script src="api.js"></script>
```

Examples:
```javascript
// Public — Load products
const { data } = await LuneAPI.getProducts({ category: "femme" });

// Public — Place order
await LuneAPI.placeOrder({
  name: "Amira", phone: "0793305740",
  wilaya: "16 - Alger", address: "...",
  items: [{ productId: 1, qty: 2 }],
  deliveryType: "domicile", deliveryFee: 400,
});

// Admin — Login sets the key
LuneAPI.setAdminKey("lunedor-admin-key-2026");

// Admin — Get all orders
const { data: orders } = await LuneAPI.getOrders({ status: "pending" });

// Admin — Update order status
await LuneAPI.setOrderStatus(3, "validated");

// Admin — Toggle product stock
await LuneAPI.toggleStock(4);

// Admin — Get dashboard stats
const { data: stats } = await LuneAPI.getStats();
```

---

## Response Format

All responses follow this structure:

```json
// Success
{ "success": true,  "data": { ... }, "count": 10 }

// Error
{ "success": false, "error": "Description of what went wrong" }
```

HTTP status codes:
- `200` OK
- `201` Created
- `400` Bad Request (validation error)
- `401` Unauthorized (missing/wrong API key)
- `404` Not Found
- `500` Internal Server Error

---

## Production Checklist

- [ ] Replace in-memory store with MongoDB or PostgreSQL
- [ ] Replace hardcoded API key with JWT + bcrypt
- [ ] Set `CORS origin` to your frontend domain
- [ ] Move secrets to `.env` file (`dotenv` package)
- [ ] Add rate limiting (`express-rate-limit`)
- [ ] Add HTTPS (reverse proxy: nginx / Caddy)
- [ ] Add input sanitisation (`express-validator` or `joi`)
