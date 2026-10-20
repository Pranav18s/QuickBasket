# QuickBasket 2026 — Development Plan

> **Status:** Phase 1 in progress
> **Last updated:** 2026-10-19

---

## Summary

| Phase | Name | Status |
|---|---|---|
| 1 | Requirements & Architecture | ✅ In progress |
| 2 | Repository & Project Scaffolding | ⬜ Not started |
| 3 | UI Design (Google Stitch) | ⬜ Not started |
| 4 | Frontend Implementation | ⬜ Not started |
| 5 | Redux Store & Cart | ⬜ Not started |
| 6 | Express API & MongoDB | ⬜ Not started |
| 7 | Authentication & Authorisation | ⬜ Not started |
| 8 | Checkout, Orders & Admin Tools | ⬜ Not started |
| 9 | Automated Tests & Bug Fixes | ⬜ Not started |
| 10 | Docker & Local Dev Environment | ⬜ Not started |
| 11 | GitHub Actions CI | ⬜ Not started |
| 12 | Deployment Planning & Portfolio Docs | ⬜ Not started |
| 13 | Future Cloud & DevOps (optional) | ⬜ Not started |

---

## Phase 1 — Requirements & Architecture

**Goal:** Establish the project's documentation and architectural blueprint before writing any application code.

### Deliverables

- [x] `docs/MASTER_PROJECT_PROMPT.md` — full specification preserved verbatim.
- [x] `docs/REQUIREMENTS.md` — functional and non-functional requirements.
- [x] `docs/ARCHITECTURE.md` — system design, folder structure, data flow.
- [x] `docs/API.md` — REST API reference (design draft).
- [x] `docs/DEVELOPMENT_PLAN.md` — this file.
- [x] `docs/DECISIONS.md` — architecture decision records.

### Definition of done

All six documentation files exist, are internally consistent, and are approved by the developer.

---

## Phase 2 — Repository & Project Scaffolding

**Goal:** Create the complete monorepo skeleton so that both apps can be started (even if they show placeholder pages).

### Tasks

1. Initialise Git repository and push to GitHub.
2. Create root `package.json` with npm workspaces.
3. Scaffold `apps/web` with Next.js (App Router, Tailwind, JavaScript only).
4. Scaffold `apps/api` with Express and Mongoose boilerplate.
5. Scaffold `packages/shared` as a local npm package.
6. Create `.gitignore`, `.editorconfig`, `.env.example`.
7. Create placeholder `README.md` and `AGENTS.md`.
8. Verify `npm install` runs cleanly at the repo root.
9. Verify `npm run dev` starts both apps.

### Definition of done

- `npm install` succeeds with zero errors.
- `npm run dev` at the repo root starts the Next.js dev server on port 3000 and the Express server on port 4000.
- `GET http://localhost:4000/api/v1/health` returns `{ "success": true }`.
- The Next.js home page renders without build errors.

---

## Phase 3 — UI Design (Google Stitch)

**Goal:** Produce visual designs before heavy frontend coding begins.

> **Note:** This phase is blocked until Google Stitch is available. Frontend implementation (Phase 4) may begin with a provisional design and be updated once designs are ready.

### Tasks

1. Design the colour palette, typography scale, and spacing system.
2. Design the home page, product listing, product detail, cart, and checkout pages.
3. Design the account and admin pages.
4. Export or document the design tokens for use in `tailwind.config.js`.

### Definition of done

Design files or exported tokens are documented and available for frontend reference.

---

## Phase 4 — Frontend Implementation

**Goal:** Build all customer-facing pages as static/mock-data pages with the full visual design.

### Tasks

1. Implement the Tailwind design system (colours, fonts, component classes).
2. Build shared layout components: `Header`, `Footer`, `Nav`, `MobileNav`.
3. Build reusable UI components: `ProductCard`, `Button`, `Input`, `Badge`, `Spinner`, `EmptyState`, `ErrorMessage`.
4. Implement all customer routes using mock/static data:
   - `/` — Home
   - `/products` — Product listing with filter sidebar
   - `/products/[slug]` — Product detail
   - `/categories/[slug]` — Category listing
   - `/search` — Search results
   - `/cart` — Cart page
   - `/checkout` — Checkout form
   - `/order-success/[orderId]` — Confirmation
   - `/login` and `/register` — Auth forms
   - `/account/*` — Account pages
   - `/service-area` — Service area checker
5. Implement all admin routes with mock data:
   - `/admin/dashboard`
   - `/admin/products` (list, new, edit)
   - `/admin/categories`
   - `/admin/orders`
   - `/admin/inventory`
   - `/admin/settings/delivery-areas`
6. Ensure all pages are responsive (375px → 1920px).
7. Verify keyboard navigation and basic accessibility.

### Definition of done

- All routes render without errors.
- Pages are visually consistent on mobile, tablet, and desktop.
- No TypeScript files are present.

---

## Phase 5 — Redux Store & Cart

**Goal:** Wire up the Redux store so the cart works correctly across the app.

### Tasks

1. Create `store/index.js` with `makeStore` factory.
2. Create `store/provider.jsx` (Client Component wrapping Redux `Provider`).
3. Create `store/cartSlice.js` with actions: `addItem`, `removeItem`, `updateQuantity`, `clearCart`.
4. Create `store/authSlice.js` with minimal client-side user state.
5. Integrate `localStorage` persistence (read after hydration only).
6. Wire `AddToCart` buttons on product pages.
7. Wire cart quantity controls on the cart page.
8. Display cart item count in the header.

### Definition of done

- Adding a product to the cart updates the Redux store and the header badge.
- Reloading the page restores cart from `localStorage`.
- No hydration mismatch warnings in the browser console.

---

## Phase 6 — Express API & MongoDB

**Goal:** Build the full backend API and connect it to MongoDB.

### Tasks

1. Set up MongoDB connection in `config/db.js`.
2. Define all Mongoose models (User, Product, Category, Order, ServiceArea, Address).
3. Implement all public API routes (health, products, categories, service areas).
4. Write database seed script with realistic sample products and categories for Edappal/Vattamkulam.
5. Connect the frontend product pages to real API data (replace mock data).
6. Implement pagination, search, and filtering in the product list endpoint.

### Seed data (samples)

Categories: Vegetables, Fruits, Grains & Pulses, Dairy, Oils & Ghee, Snacks, Beverages, Cleaning.

Products (examples, prices approximate):
- Ponni Rice 5 kg — ₹85
- Coconut Oil 1 L — ₹140
- Toor Dal 1 kg — ₹95
- Banana (Nendran) 1 kg — ₹60
- Fresh Tomato 500 g — ₹25
- Milk 1 L — ₹55

### Definition of done

- `GET /api/v1/products` returns real data from MongoDB.
- Seed script populates the database with at least 20 products and 6 categories.
- Frontend product listing displays real data.

---

## Phase 7 — Authentication & Authorisation

**Goal:** Implement full user auth (register, login, logout, protected routes).

### Tasks

1. Implement `POST /auth/register` — validate, hash password, issue JWT cookie.
2. Implement `POST /auth/login` — validate, compare hash, issue JWT cookie.
3. Implement `POST /auth/logout` — clear cookie.
4. Implement `GET /auth/me` — return current user from token.
5. Implement `auth` middleware to protect routes.
6. Implement `requireRole` middleware for admin routes.
7. Add Next.js middleware to protect frontend routes.
8. Wire login/register forms to the API.
9. Populate `authSlice` on login; clear on logout.
10. Seed an admin user in the database.

### Definition of done

- A customer can register, log in, and see their name in the header.
- Unauthenticated users are redirected from `/account` and `/checkout` to `/login`.
- Non-admin users receive 403 from any `/api/v1/admin/*` endpoint.

---

## Phase 8 — Checkout, Orders & Admin Tools

**Goal:** Complete the core business flow end-to-end.

### Tasks

1. Implement `POST /orders` — validate cart items, re-fetch prices from DB, decrement stock atomically, create order.
2. Implement `GET /orders` and `GET /orders/:id` for authenticated customers.
3. Wire the checkout form to submit an order and redirect to `/order-success/[orderId]`.
4. Implement order history and detail pages with real data.
5. Implement all admin CRUD endpoints (products, categories, inventory, orders, service areas).
6. Wire admin frontend to real API data (replace all mock data in admin pages).
7. Implement the service-area check on checkout.

### Definition of done

- A logged-in customer can place a demo order; stock is decremented; order appears in order history.
- Admin can change an order's status and see the change reflected immediately.
- Admin can create and edit products; changes appear on the frontend.

---

## Phase 9 — Automated Tests & Bug Fixes

**Goal:** Add a meaningful test suite and fix any discovered bugs.

### Tasks

1. Write unit tests for shared utility functions (paise conversion, slug generation).
2. Write integration tests for key API endpoints (health, auth, products, orders) using Supertest + Jest.
3. Write Playwright end-to-end tests for critical customer journeys:
   - Browse home → product detail → add to cart.
   - Register → log in → checkout → order confirmation.
4. Fix any bugs discovered during testing.
5. Verify no hardcoded credentials or test secrets are in the repository.

### Definition of done

- `npm test` runs all unit and integration tests with a passing result.
- At least two Playwright E2E tests pass against a locally running stack.
- Test coverage report is generated (doesn't need to be 100%).

---

## Phase 10 — Docker & Local Dev Environment

**Goal:** The full stack starts with a single `docker-compose up`.

### Tasks

1. Write `apps/api/Dockerfile` (multi-stage, production-ready).
2. Write `apps/web/Dockerfile` (multi-stage, production-ready).
3. Write `docker-compose.yml` including `mongo`, `api`, `web` services with correct env wiring.
4. Verify `docker-compose up --build` starts all three services cleanly.
5. Verify the seed script runs inside Docker.
6. Document local setup in `README.md`.

### Definition of done

- `docker-compose up` starts the stack without manual steps beyond setting `.env`.
- The application works end-to-end inside Docker containers.

---

## Phase 11 — GitHub Actions CI

**Goal:** Automated CI checks run on every push and pull request.

### Tasks

1. Write `.github/workflows/ci.yml`.
2. CI jobs: install → lint → test → build (for both apps).
3. Verify the workflow passes on the main branch.

### Definition of done

- GitHub Actions shows a green check on the main branch.
- A failing test causes the CI workflow to fail (verified with a temporary bad test).

---

## Phase 12 — Deployment Planning & Portfolio Docs

**Goal:** Prepare the project for portfolio presentation.

### Tasks

1. Write a complete, honest `README.md` (what it is, what works, what's demo-only, how to run locally).
2. Write `AGENTS.md` describing how an AI coding agent should approach this codebase.
3. Add screenshots or a short screen recording to the README.
4. Research deployment options (Railway, Render, Fly.io) — no actual deployment without approval.
5. Document the deployment plan in `docs/DECISIONS.md`.

### Definition of done

- README is complete and accurate.
- A visitor can clone the repo and run the project locally by following the README.

---

## Phase 13 — Future Cloud & DevOps (optional)

Planned improvements subject to approval and budget:

- Deploy to a cloud platform.
- Set up a custom domain.
- Connect Cloudinary for product image hosting.
- Add Redis for caching and rate limiting.
- Integrate Razorpay for real payments.
- Set up monitoring and logging (Sentry, Logtail).
- Implement multi-vendor support.
