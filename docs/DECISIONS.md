# QuickBasket 2026 — Architecture Decision Records

> ADRs document the *why* behind important technical choices. New decisions should be added here as they are made, even if they later change.
>
> **Format:** Status is one of `Accepted`, `Superseded`, `Deprecated`, or `Proposed`.
> **Last updated:** 2026-10-19

---

## ADR-001 — JavaScript only (no TypeScript)

**Date:** 2026-10-19
**Status:** Accepted

### Decision

Use JavaScript and JSX exclusively. Do not introduce TypeScript, `.ts`, `.tsx`, or any TypeScript-specific configuration.

### Reason

The project owner has specified JavaScript as the required language. TypeScript would add compilation configuration complexity and is not desired for this portfolio project. JSDoc comments will be used in complex utility functions to provide type hints in IDEs without requiring TypeScript.

### Consequences

- Some IDE type-checking features are weaker without TypeScript.
- New contributors who expect TypeScript will need to adapt.
- No TS-only packages (e.g. `@types/*`) are installed unless they also support JS consumers.

---

## ADR-002 — npm workspaces monorepo

**Date:** 2026-10-19
**Status:** Accepted

### Decision

Use npm workspaces with a single root `package.json` to manage `apps/web`, `apps/api`, and `packages/shared` as workspace packages.

### Reason

- npm workspaces are built into npm 7+ and require no additional tooling (no Nx, Turborepo, Lerna).
- A shared `node_modules` at the root avoids duplicate installs.
- The `packages/shared` workspace can be imported in both apps as `@quickbasket/shared` without publishing to npm.
- Simpler to understand for a beginner audience than a full monorepo build system.

### Consequences

- A Turborepo or similar build pipeline is not available; `npm run dev` scripts must be run per-app or via `concurrently` at the root.
- If the project grows significantly, migrating to Turborepo would be straightforward.

---

## ADR-003 — Next.js App Router

**Date:** 2026-10-19
**Status:** Accepted

### Decision

Use Next.js with the App Router (introduced in Next.js 13, stable in 14+), not the Pages Router.

### Reason

- The App Router is the recommended approach for new Next.js projects.
- Server Components reduce unnecessary JavaScript sent to the browser for read-only pages.
- Nested layouts are cleaner than the Pages Router's `_app.js` / `_document.js` approach.
- Demonstrates modern React patterns (server vs client components).

### Consequences

- Redux must be configured carefully: the store must not be a shared singleton across server requests. A `makeStore` factory and the `StoreProvider` client component pattern is used.
- Some third-party libraries may not yet fully support Server Components; these will be used in Client Components only.

---

## ADR-004 — Redux Toolkit for cart state

**Date:** 2026-10-19
**Status:** Accepted

### Decision

Use Redux Toolkit (RTK) with React Redux for the cart and minimal auth state. Do not use RTK Query for API calls.

### Reason

The project specification explicitly requires Redux Toolkit. RTK Query is a good fit for data-fetching but would add complexity. Given the App Router's server-component data-fetching capabilities, standard `fetch` is preferred for most API calls. Redux is reserved for genuinely global mutable UI state (cart, current user identity).

### Consequences

- API responses are not cached in Redux; server components or `useEffect`-based fetching handles data.
- The cart is stored in Redux and persisted to `localStorage` via a custom middleware (safe from SSR hydration issues).

---

## ADR-005 — Monetary values stored as integer paise

**Date:** 2026-10-19
**Status:** Accepted

### Decision

All monetary values in the database and API are stored and transmitted as **integer paise** (1 INR = 100 paise). Display conversion to rupees happens only in the frontend.

### Reason

- Floating-point arithmetic is unreliable for monetary calculations (`0.1 + 0.2 !== 0.3` in JavaScript).
- Integer paise avoids all rounding errors.
- This is the industry-standard approach used by Stripe, Razorpay, and others.

### Consequences

- Every price field is named with the `Paise` suffix (e.g., `pricePaise`, `totalPaise`) for clarity.
- The `packages/shared/utils/paise.js` utility provides `toPaise`, `toRupees`, and `formatINR` helpers.
- API consumers must divide by 100 to display amounts in rupees.

---

## ADR-006 — JWT in httpOnly cookies

**Date:** 2026-10-19
**Status:** Accepted

### Decision

Issue JSON Web Tokens in httpOnly, SameSite=Lax cookies. Do not store JWTs in `localStorage` or expose them to JavaScript.

### Reason

- `localStorage` is accessible by JavaScript, making it vulnerable to XSS attacks.
- httpOnly cookies cannot be read by JavaScript; they are automatically sent with same-origin requests.
- SameSite=Lax provides CSRF protection for standard navigation while allowing cross-site GET requests.

### Consequences

- The frontend cannot directly read the JWT; it calls `GET /auth/me` to get user information after page load.
- CORS must be configured with `credentials: true` for cross-origin development (e.g., Next.js on port 3000 calling Express on port 4000).

---

## ADR-007 — Soft-delete for products and categories

**Date:** 2026-10-19
**Status:** Accepted

### Decision

Products and categories are never hard-deleted from the database. Instead, an `active: Boolean` flag is set to `false`.

### Reason

- Orders contain snapshots of product names and prices, but the `productId` field references the original product.
- Hard-deleting a product would break the referential integrity of order records.
- Soft-delete preserves the full audit trail.

### Consequences

- All public-facing queries must filter `{ active: true }`.
- Admin queries can optionally include inactive records.
- Deleted products do not reappear in search results or category pages.

---

## ADR-008 — Order item snapshots

**Date:** 2026-10-19
**Status:** Accepted

### Decision

When an order is placed, the current product `name`, `pricePaise`, `image`, `packageSize`, and `slug` are copied into the order's `items` array as a snapshot. The `productId` reference is also stored but is not relied upon for display.

### Reason

- Product prices and names change over time. An order must always display what the customer was actually charged.
- This is standard practice in e-commerce databases.

### Consequences

- Order history is accurate even if a product is later renamed, repriced, or deactivated.
- The `productId` in the snapshot allows future features like "buy again" to link back to the current product listing.

---

## ADR-009 — Single vendor (no marketplace)

**Date:** 2026-10-19
**Status:** Accepted

### Decision

The initial release has one inventory source and no multi-vendor features.

### Reason

Multi-vendor logic adds significant complexity (vendor accounts, per-vendor payouts, vendor-specific routing) that is out of scope for a portfolio demonstration.

### Consequences

- All products belong to a single implied "QuickBasket" store.
- A `vendor` field is not added to the Product model now; adding it later is a straightforward migration.

---

## ADR-010 — COD only (no payment gateway)

**Date:** 2026-10-19
**Status:** Accepted

### Decision

The initial release supports only Cash on Delivery (COD) as a payment method. No real payment gateway is integrated.

### Reason

- Connecting Razorpay or Stripe requires business registration and API credentials.
- This is a portfolio demo; no real money is processed.
- The architecture is designed so that a payment gateway can be added without restructuring orders.

### Consequences

- `paymentMethod` is always `"cod"` and `paymentStatus` starts as `"pending"`.
- The checkout page must clearly label this as a demo.

---

## ADR-011 — Express-validator for server-side validation

**Date:** 2026-10-19
**Status:** Accepted

### Decision

Use `express-validator` for server-side request body validation in Express.

### Reason

- `express-validator` is mature, well-documented, and integrates naturally with Express middleware chains.
- It produces structured error arrays that match the project's API error response format.
- Zod is reserved for shared schemas in `packages/shared` that are used on both frontend and backend.

### Consequences

- Validation rules live alongside route definitions in the `routes/` directory.
- A shared `validate` middleware collects errors from `validationResult` and returns a consistent 400 response.

---

## ADR-012 — Atomic stock decrement to reduce overselling

**Date:** 2026-10-19
**Status:** Accepted

### Decision

Stock is decremented using MongoDB's `$inc` operator in a single atomic update per product, combined with a pre-flight stock availability check.

### Reason

- Mongoose's `save()` pattern reads stock, modifies it in Node.js, and writes back — creating a race condition under concurrent orders.
- `findOneAndUpdate` with `$inc` and a filter clause (`stock: { $gte: quantity }`) performs the check and decrement atomically in MongoDB.

### Consequences

- If concurrent orders race for the last unit, only the first update succeeds. Subsequent orders receive a 409 Conflict.
- Full multi-document transactions (MongoDB sessions) are not used in Phase 8; revisit if the race condition proves inadequate.

---

## Future decisions (pending)

| Topic | Likely decision | Phase |
|---|---|---|
| Image hosting | Local `/public` initially; Cloudinary later | 6 / 13 |
| Deployment platform | Railway or Render (free tier) | 12 |
| Refresh tokens | Add if 7-day access token lifespan causes complaints | 7+ |
| Redis caching | Add in Phase 13 if response times are a concern | 13 |
| MongoDB transactions | Add for order + stock decrement atomicity if needed | 8+ |
