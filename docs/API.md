# QuickBasket 2026 — API Reference

> **Status:** Design draft — Phase 1 (Requirements & Architecture)
> **Base URL (local):** `http://localhost:4000/api/v1`
> **Last updated:** 2026-10-19

---

## Conventions

- All request and response bodies are JSON.
- All monetary values are **integer paise** (₹1 = 100 paise). Divide by 100 to display in rupees.
- Successful responses return `{ "success": true, "data": { … } }`.
- Error responses return `{ "success": false, "message": "…", "errors": [ … ] }`.
- Authenticated endpoints require a valid JWT in an httpOnly cookie named `qb_token`.
- Admin endpoints additionally require `user.role === "admin"`.
- ObjectIds that fail MongoDB's format check return `400 Bad Request`.

### HTTP status codes used

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (wrong role) |
| 404 | Not found |
| 409 | Conflict (e.g. duplicate email) |
| 500 | Unexpected server error |

---

## Health

### `GET /health`

Public. Returns API status.

**Response 200**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-10-19T13:00:00.000Z"
  }
}
```

---

## Authentication

### `POST /auth/register`

Create a new customer account.

**Request body**
```json
{
  "name": "Arjun Nair",
  "email": "arjun@example.com",
  "password": "SecurePass123!"
}
```

**Validation**
- `name` — required, 2–60 characters.
- `email` — required, valid email format, unique.
- `password` — required, minimum 8 characters.

**Response 201**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "Arjun Nair",
      "email": "arjun@example.com",
      "role": "customer"
    }
  }
}
```

Sets httpOnly cookie `qb_token`.

---

### `POST /auth/login`

**Request body**
```json
{
  "email": "arjun@example.com",
  "password": "SecurePass123!"
}
```

**Response 200** — Same shape as register. Sets `qb_token` cookie.

**Response 401** — Invalid credentials (same generic message regardless of which field is wrong).

---

### `POST /auth/logout`

Authenticated. Clears the `qb_token` cookie.

**Response 200**
```json
{ "success": true, "data": { "message": "Logged out" } }
```

---

### `GET /auth/me`

Authenticated. Returns the current user.

**Response 200**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "Arjun Nair",
      "email": "arjun@example.com",
      "role": "customer"
    }
  }
}
```

---

### `PUT /auth/me`

Authenticated. Update name or email.

**Request body**
```json
{
  "name": "Arjun K. Nair"
}
```

---

## Products (public)

### `GET /products`

Returns active products. Supports query parameters:

| Param | Type | Description |
|---|---|---|
| `page` | integer | Page number (default 1) |
| `limit` | integer | Items per page (default 20, max 100) |
| `category` | string | Category slug |
| `q` | string | Keyword search (name, description) |
| `minPrice` | integer | Minimum price in paise |
| `maxPrice` | integer | Maximum price in paise |
| `sort` | string | `price_asc`, `price_desc`, `newest`, `name_asc` |

**Response 200**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "...",
        "name": "Ponni Rice",
        "slug": "ponni-rice",
        "description": "Premium quality Ponni rice from Tamil Nadu.",
        "category": { "_id": "...", "name": "Grains & Pulses", "slug": "grains-pulses" },
        "pricePaise": 8500,
        "comparePricePaise": 9500,
        "image": "/images/products/ponni-rice.jpg",
        "packageSize": "5 kg",
        "stock": 42,
        "active": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 85,
      "pages": 5
    }
  }
}
```

---

### `GET /products/:slug`

Returns a single active product by slug.

**Response 200** — Single product object (same shape as above).
**Response 404** — Product not found or inactive.

---

## Categories (public)

### `GET /categories`

Returns all active categories.

**Response 200**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "_id": "...",
        "name": "Vegetables",
        "slug": "vegetables",
        "description": "Fresh local vegetables",
        "image": "/images/categories/vegetables.jpg"
      }
    ]
  }
}
```

---

### `GET /categories/:slug`

Returns a single active category by slug.

---

### `GET /categories/:slug/products`

Returns active products in the named category. Supports the same pagination and sort query params as `GET /products`.

---

## Service areas (public)

### `GET /service-areas`

Returns all enabled service areas.

**Response 200**
```json
{
  "success": true,
  "data": {
    "serviceAreas": [
      {
        "_id": "...",
        "name": "Edappal",
        "pinCode": "679576",
        "deliveryFeePaise": 2500
      }
    ]
  }
}
```

---

### `POST /service-areas/check`

Check whether a PIN code is within a service area.

**Request body**
```json
{ "pinCode": "679576" }
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "serviceable": true,
    "area": {
      "name": "Edappal",
      "deliveryFeePaise": 2500
    }
  }
}
```

**Response 200 (not serviceable)**
```json
{
  "success": true,
  "data": { "serviceable": false }
}
```

---

## Orders (customer — authenticated)

### `POST /orders`

Create a new order. The backend re-validates prices and stock; client-supplied prices are ignored.

**Request body**
```json
{
  "items": [
    { "productId": "...", "quantity": 2 },
    { "productId": "...", "quantity": 1 }
  ],
  "address": {
    "recipientName": "Arjun Nair",
    "phone": "9876543210",
    "line1": "12/A Main Road",
    "line2": "",
    "locality": "Edappal",
    "pinCode": "679576",
    "district": "Malappuram",
    "state": "Kerala"
  },
  "paymentMethod": "cod"
}
```

**Validation**
- `items` — required, non-empty array.
- Each item: `productId` valid ObjectId, `quantity` integer ≥ 1.
- `address.pinCode` — must match an enabled service area.
- `paymentMethod` — must be `"cod"` (initially).

**Response 201**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "...",
      "orderStatus": "placed",
      "totalPaise": 19500,
      "createdAt": "2026-10-19T13:00:00.000Z"
    }
  }
}
```

---

### `GET /orders`

Returns the authenticated customer's orders, newest first.

**Response 200**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "...",
        "orderStatus": "placed",
        "totalPaise": 19500,
        "itemCount": 3,
        "createdAt": "..."
      }
    ]
  }
}
```

---

### `GET /orders/:id`

Returns full detail for one of the customer's own orders.

**Response 200** — Full order document including item snapshots.
**Response 403** — Order belongs to a different customer.
**Response 404** — Order not found.

---

## Admin — Products

All endpoints under `/admin/*` require `role === "admin"`.

### `GET /admin/products`

Returns all products (including inactive). Supports `page`, `limit`, `q`, `category`, `active` query params.

---

### `POST /admin/products`

Create a new product.

**Request body**
```json
{
  "name": "Ponni Rice",
  "description": "Premium quality Ponni rice.",
  "category": "<categoryId>",
  "pricePaise": 8500,
  "comparePricePaise": 9500,
  "image": "/images/products/ponni-rice.jpg",
  "packageSize": "5 kg",
  "stock": 100,
  "active": true
}
```

Slug is auto-generated from `name`. **Response 201.**

---

### `GET /admin/products/:id`

Returns a single product by MongoDB ObjectId (not slug).

---

### `PUT /admin/products/:id`

Update any product fields. **Response 200.**

---

### `PATCH /admin/products/:id/deactivate`

Soft-deletes a product by setting `active: false`. **Response 200.**

---

## Admin — Categories

### `GET /admin/categories`

All categories (including inactive).

### `POST /admin/categories`

Create a category. Body: `name`, `description`, `image`, `active`.

### `PUT /admin/categories/:id`

Update a category.

### `PATCH /admin/categories/:id/deactivate`

Soft-delete a category.

---

## Admin — Inventory

### `GET /admin/inventory`

Returns all products with current `stock` values. Optionally filter `?lowStock=true` (stock < 10).

### `PATCH /admin/inventory/:productId`

Update stock for a product.

**Request body**
```json
{ "stock": 75 }
```

---

## Admin — Orders

### `GET /admin/orders`

Returns all orders. Supports `?status=placed`, `?page`, `?limit`, `?from`, `?to` date filters.

---

### `GET /admin/orders/:id`

Returns full order detail.

---

### `PATCH /admin/orders/:id/status`

Update an order's status.

**Request body**
```json
{
  "status": "confirmed",
  "note": "Payment verified by phone"
}
```

Valid transitions: `placed → confirmed → out_for_delivery → delivered` or `any → cancelled`.

---

## Admin — Service areas

### `GET /admin/service-areas`

All service areas (including disabled).

### `POST /admin/service-areas`

Create a service area. Body: `name`, `pinCode`, `deliveryFeePaise`, `enabled`.

### `PUT /admin/service-areas/:id`

Update a service area.

### `DELETE /admin/service-areas/:id`

Permanently delete a service area (admin only, safe since no orders reference service areas directly).

---

## Error response reference

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Must be a valid email address" }
  ]
}
```

For 500 errors in production, the `errors` array is omitted and only a generic message is returned. In development, a `stack` field may be included.
