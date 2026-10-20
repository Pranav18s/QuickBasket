# QuickBasket 2026 — Architecture

> **Status:** Draft — Phase 1 (Requirements & Architecture)
> **Last updated:** 2026-10-19

---

## 1. Overview

QuickBasket 2026 is a monorepo containing two applications:

- **`apps/web`** — Next.js 14+ frontend (App Router).
- **`apps/api`** — Express.js REST API backend.

They communicate over HTTP. In production they would run as separate processes, optionally behind a reverse proxy. In local development both run concurrently via `npm run dev` at the repo root, with the Next.js dev server proxying `/api` requests to Express.

```
Browser
  │
  ├─ Static & SSR pages ──► Next.js (apps/web) :3000
  │
  └─ /api/v1/* requests ──► Express (apps/api) :4000
                                  │
                                  └─ MongoDB :27017
```

---

## 2. Monorepo layout

```
QuickBasket-2026/
├── apps/
│   ├── web/                    # Next.js App Router frontend
│   │   ├── app/                # Route segments, layouts, pages, loading, error
│   │   ├── components/         # Reusable UI components
│   │   ├── lib/                # Client-side utilities, API fetch helpers
│   │   ├── store/              # Redux store, slices, provider
│   │   ├── public/             # Static assets
│   │   ├── next.config.mjs
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   └── api/                    # Express backend
│       ├── src/
│       │   ├── config/         # DB connection, environment helpers
│       │   ├── models/         # Mongoose schemas
│       │   ├── routes/         # Express routers (v1)
│       │   ├── controllers/    # Request handlers (thin)
│       │   ├── services/       # Business logic
│       │   ├── middleware/     # Auth, roles, error handler, validators
│       │   └── utils/          # Shared helpers (slug, paise conversion, etc.)
│       ├── seed/               # Database seed scripts
│       ├── .env.example
│       └── package.json
│
├── packages/
│   └── shared/                 # Pure JS utilities shared by web and api
│       ├── src/
│       │   ├── validation/     # Zod schemas (used in both places)
│       │   └── utils/          # Price formatting, slug helpers, etc.
│       └── package.json
│
├── docs/                       # All documentation
├── .github/workflows/ci.yml
├── docker-compose.yml
├── README.md
├── AGENTS.md
├── .env.example
├── .gitignore
├── .editorconfig
└── package.json                # Root: workspaces, scripts
```

---

## 3. Frontend architecture (apps/web)

### 3.1 Next.js App Router

- All routes live under `app/`.
- Shared layouts (header, footer, nav) use nested layout files (`layout.jsx`).
- Pages that need interactivity (cart, forms) are Client Components (`"use client"`).
- Pages that are primarily data display (product list, product detail) are Server Components by default, fetching data server-side.
- A root `providers.jsx` Client Component wraps the app in the Redux `<Provider>`.

### 3.2 Redux store

- Configured in `store/index.js` using `configureStore` from Redux Toolkit.
- Slices:
  - `cartSlice` — manages cart items (add, remove, update quantity, clear).
  - `authSlice` — minimal client-side user identity (name, role) after login; the backend is authoritative.
- The store is instantiated per-browser-session. A `makeStore` factory function prevents shared singleton state across SSR requests.
- Cart state is persisted to `localStorage` using a custom middleware approach that is safe from hydration mismatches (reads only after mount).

### 3.3 Styling

- Tailwind CSS with a custom theme (colours, typography, spacing) defined in `tailwind.config.js`.
- Component-level styles use Tailwind utility classes only; no CSS Modules unless a specific need arises.
- Global styles (`app/globals.css`) import Tailwind base, components, and utilities.

### 3.4 Data fetching strategy

| Scenario | Approach |
|---|---|
| Product listing / detail (SEO-important) | Server Component + `fetch` with Next.js caching |
| Cart contents | Client-side Redux state (localStorage persisted) |
| Authenticated user orders | Client Component + SWR or `fetch` in useEffect |
| Admin CRUD forms | Client Component + `fetch` |
| Real-time stock (future) | Not in scope yet |

### 3.5 Route protection

- Customer-only routes (checkout, account) redirect unauthenticated users to `/login` using Next.js middleware (`middleware.js` at the root of `apps/web`).
- Admin routes additionally check `role === 'admin'`; mismatched roles redirect to `/`.
- The backend independently enforces authorisation on every API request — frontend guards are UX only.

---

## 4. Backend architecture (apps/api)

### 4.1 Express application structure

```
src/
├── config/
│   ├── db.js          # Mongoose connection
│   └── env.js         # Validated environment variables
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Order.js
│   ├── ServiceArea.js
│   └── Address.js
├── routes/
│   └── v1/
│       ├── index.js   # Mounts all v1 routers
│       ├── auth.js
│       ├── products.js
│       ├── categories.js
│       ├── orders.js
│       ├── serviceAreas.js
│       └── admin/
│           ├── products.js
│           ├── orders.js
│           ├── inventory.js
│           └── serviceAreas.js
├── controllers/       # One file per resource; thin handlers
├── services/          # Business logic; called by controllers
├── middleware/
│   ├── auth.js        # JWT verify, attach req.user
│   ├── requireRole.js # Role-based access control
│   ├── validate.js    # express-validator error handler
│   └── errorHandler.js
└── utils/
    ├── ApiError.js    # Custom error class
    └── asyncHandler.js
```

### 4.2 Authentication

- JWT-based authentication.
- Tokens issued as httpOnly, Secure (in production), SameSite=Lax cookies.
- Access token lifetime: 7 days (adjustable via env).
- No refresh token in the initial implementation; revisit if required.
- The `auth` middleware extracts and verifies the JWT on every protected request.
- The `requireRole('admin')` middleware checks `req.user.role`.

### 4.3 Validation

- `express-validator` for input validation on all POST/PUT/PATCH routes.
- A shared `validate` middleware collects validation errors and returns `400` with a structured error array.
- ObjectIds are validated before any database query.

### 4.4 Error handling

- All async route handlers are wrapped in `asyncHandler` to catch rejected promises.
- A global `errorHandler` middleware converts errors to a consistent JSON response format:

```json
{
  "success": false,
  "message": "Human-readable message",
  "errors": []
}
```

- HTTP 404 for unknown routes, 400 for validation errors, 401 for unauthenticated, 403 for forbidden, 500 for unexpected errors.

---

## 5. Database design

See `docs/REQUIREMENTS.md` Section 9 for full field lists.

### 5.1 MongoDB / Mongoose conventions

- All schemas use `{ timestamps: true }` for `createdAt` and `updatedAt`.
- Monetary values are stored as **integer paise** (₹1 = 100 paise). The API always returns paise; display conversion happens in the frontend.
- Slugs are pre-computed on save and indexed for fast lookups.
- Soft-delete is implemented via an `active: Boolean` flag; records are never hard-deleted (preserves order history integrity).

### 5.2 Indexes

| Collection | Indexed fields |
|---|---|
| User | `email` (unique) |
| Product | `slug` (unique), `category`, `active` |
| Category | `slug` (unique), `active` |
| Order | `customer`, `orderStatus`, `createdAt` |
| ServiceArea | `pinCode`, `enabled` |

### 5.3 Order integrity

- When an order is placed, the backend:
  1. Re-fetches each product from the database.
  2. Verifies the product is active and stock ≥ quantity.
  3. Captures the current price (pricePaise) into the order item snapshot.
  4. Decrements stock using `$inc: { stock: -quantity }` in a single atomic update per product.
- Price and name snapshots in the order document do not change if the product is later edited.

---

## 6. Shared package (packages/shared)

Contains only pure JavaScript with no framework dependencies:

- `validation/schemas.js` — Zod schemas reused by both the frontend (client-side form validation) and the backend.
- `utils/paise.js` — `toPaise(rupees)`, `toRupees(paise)`, `formatINR(paise)`.
- `utils/slug.js` — `toSlug(string)` using `slugify`.

---

## 7. Infrastructure and DevOps

### 7.1 Local development

```
docker-compose up
```

Starts:
- `mongo` — MongoDB 7 on port 27017.
- `api` — Express on port 4000 (with nodemon).
- `web` — Next.js on port 3000 (with hot reload).

### 7.2 Environment variables

All secrets live in `.env` (gitignored). `.env.example` lists all required variables with placeholder values. See that file for the full list.

### 7.3 GitHub Actions CI

`.github/workflows/ci.yml` runs on every push and pull request:

1. Install dependencies (`npm ci`).
2. Lint (`npm run lint`).
3. Unit/integration tests (`npm test`).
4. Build check (`npm run build`).

### 7.4 Dockerfiles

- `apps/web/Dockerfile` — multi-stage build: install → build → production image.
- `apps/api/Dockerfile` — multi-stage build: install → production image.

---

## 8. Security considerations

| Concern | Mitigation |
|---|---|
| Password storage | bcrypt, cost factor 12 |
| Secrets | `.env` only, gitignored |
| JWT storage | httpOnly cookie |
| Admin access | Server-side role check on every admin route |
| CORS | Configured for the frontend origin only |
| Security headers | `helmet` middleware |
| Rate limiting | `express-rate-limit` on auth routes |
| Input validation | `express-validator` on all mutation endpoints |
| Overselling | Atomic `$inc` decrement + pre-flight stock check |
| Client-supplied prices | Ignored; backend re-fetches from DB |

---

## 9. Architecture decisions

See `docs/DECISIONS.md` for the rationale behind key choices.

---

## 10. Future considerations (out of scope now)

- Redis for session management or caching.
- Stripe or Razorpay payment integration.
- CDN for product images (Cloudinary, S3).
- Real-time order tracking (WebSockets).
- Multi-vendor support.
- Malayalam language internationalisation.
- Cloud deployment (AWS / GCP / Railway).
