# QUICKBASKET 2026 — MASTER PROJECT PROMPT

> This file is the authoritative source of truth for the project. Keep it up to date as decisions evolve. Never replace the full requirements with a short summary.

---

## 1. Project role

Act as my senior full-stack engineer, software architect, technical mentor, and coding agent. Help me build QuickBasket 2026 incrementally, explaining important decisions in beginner-friendly English.

You may create and edit files directly in the approved project workspace, run appropriate development commands, install necessary packages, test the application, and fix errors. Do not merely give me code snippets to copy manually when you can safely implement them in the workspace.

---

## 2. Product goal

Build QuickBasket 2026, an original grocery-ordering website intended as a full-stack developer portfolio project.

Target region: Edappal and Vattamkulam, Kerala, India.

Initial model: portfolio demo with realistic sample grocery products. We may look for a real shop partner later. Fulfilment arrangements are undecided.

Build one sample inventory source first. Do not implement a multi-vendor marketplace now. Do not claim that real inventory, delivery, or payments are active.

---

## 3. Fixed technology stack

Use the following stack:

| Layer | Technology |
|---|---|
| Frontend | Next.js App Router |
| Language | JavaScript and JSX only |
| State management | Redux Toolkit + React Redux |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB with Mongoose |
| Package management | npm + npm workspaces |
| Browser testing | Playwright (where appropriate) |
| Version control | Git + GitHub |
| Containers | Docker + Docker Compose |
| CI | GitHub Actions (YAML) |

**Never use TypeScript.** Do not create `.ts`, `.tsx`, or TypeScript-only configuration files. Use `.js`, `.jsx`, `.mjs`, JSON, Markdown, and YAML where appropriate.

---

## 4. Customer functionality

The customer must be able to:

- Browse featured and all products.
- Browse product categories.
- Search and filter products.
- View product details.
- Add products to a shopping cart.
- Change quantities and remove items.
- Enter an address manually.
- Check whether an address falls within configured demo service areas.
- Complete a clearly labelled demo checkout.
- View order confirmation and order history.
- Register, log in, and view their account.

Use realistic sample products and INR pricing.

---

## 5. Admin functionality

An authorised administrator must be able to:

- View a dashboard with clearly identified demo metrics.
- Create, read, update, and deactivate products.
- Manage categories.
- Update stock quantities.
- View orders and their details.
- Change order statuses.
- Configure demo service areas.

Admin access must be enforced by the backend, not merely by hiding frontend buttons or pages.

---

## 6. Pages and routes

### Customer routes

| Route | Purpose |
|---|---|
| `/` | Home / landing page |
| `/products` | All products listing |
| `/products/[slug]` | Product detail page |
| `/categories/[slug]` | Category product listing |
| `/search` | Search results with filters |
| `/cart` | Shopping cart |
| `/checkout` | Demo checkout |
| `/order-success/[orderId]` | Order confirmation |
| `/login` | Login page |
| `/register` | Registration page |
| `/account` | Account overview |
| `/account/orders` | Order history list |
| `/account/orders/[orderId]` | Order detail |
| `/account/profile` | Edit profile |
| `/service-area` | Service area checker |

### Admin routes

| Route | Purpose |
|---|---|
| `/admin/dashboard` | Demo metrics dashboard |
| `/admin/products` | Product list |
| `/admin/products/new` | Create product |
| `/admin/products/[id]/edit` | Edit product |
| `/admin/categories` | Category management |
| `/admin/orders` | Order list |
| `/admin/orders/[id]` | Order detail and status |
| `/admin/inventory` | Stock management |
| `/admin/settings/delivery-areas` | Service area config |

Use a consistent layout and protect restricted routes appropriately.

---

## 7. Redux requirements

Use Redux Toolkit and React Redux for shared client-side state.

- Create a Redux store and a suitable Provider for the Next.js App Router.
- Ensure the implementation works correctly with server components and client components.
- Do not make the Redux store a shared mutable singleton across server requests.

### Cart slice actions

- Add an item.
- Remove an item.
- Update quantity.
- Clear the cart.

### Cart state design

- Store product identifiers and selected quantities.
- Include only the additional display data that is useful (name, price, image).
- Handle duplicate products consistently (merge rather than duplicate).

### Persistence

- Persist the cart in the browser using a safe client-side approach.
- Avoid server/client hydration mismatches.
- Do not access browser storage during server rendering.

### Important constraints

- Do not treat Redux as the authoritative source of prices, inventory, user permissions, or orders.
- The backend must validate current prices and stock before creating an order.
- Use Redux for genuinely shared client-side state; do not put every API response into Redux without a reason.

---

## 8. Backend API

Create a versioned REST API under `/api/v1`.

### Endpoints

| Group | Endpoints |
|---|---|
| Health | `GET /api/v1/health` |
| Auth | Register, login, logout, current-user |
| Products | List, detail (public) |
| Categories | List, detail (public) |
| Service areas | List, check-address |
| Orders (customer) | Create, list, detail |
| Products (admin) | Create, read, update, deactivate |
| Orders (admin) | List, detail, status-update |
| Inventory (admin) | Stock update |
| Service areas (admin) | Create, update, delete |

Keep route handlers, controllers, services, middleware, validation, and database models organised in a maintainable structure. Avoid unnecessary abstraction for a beginner-sized project.

---

## 9. Data models

Store monetary values as **integer paise** (1 ₹ = 100 paise). Document the conversion wherever prices are displayed.

### User

| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | unique, required |
| passwordHash | String | bcrypt, never returned to client |
| role | String | `customer` or `admin` |
| createdAt, updatedAt | Date | Mongoose timestamps |

### Product

| Field | Type | Notes |
|---|---|---|
| name | String | required |
| slug | String | unique, URL-safe |
| description | String | |
| category | ObjectId → Category | |
| pricePaise | Number | integer paise |
| comparePricePaise | Number | optional, for "was" price |
| image | String | URL or path |
| packageSize | String | e.g. "1 kg", "500 ml" |
| stock | Number | integer units |
| active | Boolean | default true |
| createdAt, updatedAt | Date | |

### Category

| Field | Type | Notes |
|---|---|---|
| name | String | required |
| slug | String | unique |
| description | String | |
| image | String | optional |
| active | Boolean | default true |

### Order

| Field | Type | Notes |
|---|---|---|
| customer | ObjectId → User | |
| items | Array | snapshots (see below) |
| subtotalPaise | Number | |
| deliveryFeePaise | Number | |
| totalPaise | Number | |
| address | Object | delivery address |
| paymentMethod | String | e.g. `cod` |
| paymentStatus | String | `pending`, `paid` |
| orderStatus | String | `placed`, `confirmed`, `out_for_delivery`, `delivered`, `cancelled` |
| statusHistory | Array | `{ status, updatedAt, note }` |
| createdAt, updatedAt | Date | |

**Order item snapshot fields:** `productId`, `name`, `slug`, `image`, `packageSize`, `pricePaise`, `quantity`.

Prices are captured at order-placement time and must not change if the product price changes later.

### ServiceArea

| Field | Type | Notes |
|---|---|---|
| name | String | e.g. "Edappal" |
| pinCode | String | optional |
| enabled | Boolean | |
| deliveryFeePaise | Number | demo fee |

### Address

| Field | Type | Notes |
|---|---|---|
| customer | ObjectId → User | |
| recipientName | String | |
| phone | String | |
| line1 | String | |
| line2 | String | optional |
| locality | String | |
| pinCode | String | |
| district | String | |
| state | String | default "Kerala" |

---

## 10. Security and reliability

- Keep secrets in environment variables.
- Provide `.env.example` with placeholders, never real credentials.
- Exclude `.env` and secrets from Git.
- Hash passwords using bcrypt or argon2.
- Validate request bodies on the server (express-validator or Zod).
- Validate ObjectIds and handle invalid records safely.
- Protect admin APIs with server-side role checks.
- Configure CORS intentionally.
- Add appropriate security headers (helmet) and rate limiting (express-rate-limit).
- Use safe authentication and cookie practices (httpOnly JWT cookies or equivalent).
- Do not trust client-supplied prices, totals, roles, or stock availability.
- Prevent orders from exceeding available stock.
- Use appropriate database operations (`$inc`, transactions where needed) to reduce overselling risks.
- Never put secrets in frontend code.
- Do not claim security or tests are complete unless verified.

---

## 11. UI/UX requirements

- Create a modern, original, responsive grocery website.
- Do not copy existing grocery brands.
- Use a consistent design system, reusable components, accessible forms.
- Show clear validation, loading states, empty states, and useful error messages.
- The website must support desktop, tablet, and mobile browsers.
- This is one responsive website, not a separate mobile app.
- Use the Google Stitch design as the visual reference once it is available.
- Do not block initial project setup while waiting for the design.

---

## 12. Monorepo structure

```
QuickBasket-2026/
├── apps/
│   ├── web/           # Next.js App Router frontend
│   └── api/           # Express backend
├── packages/
│   └── shared/        # Reusable JS utilities and shared validation schemas
├── docs/              # All documentation
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
├── README.md
├── AGENTS.md
├── .env.example
├── .gitignore
├── .editorconfig
└── package.json       # Root workspace config + lockfile
```

Adapt this structure only if there is a clear technical reason, and explain the reason before making a major architectural change.

---

## 13. Development and DevOps plan

Build incrementally in these phases:

| Phase | Focus |
|---|---|
| 1 | Requirements and architecture |
| 2 | Repository and project scaffolding |
| 3 | UI design in Google Stitch |
| 4 | Responsive frontend implementation |
| 5 | Redux store and cart functionality |
| 6 | Express API and MongoDB integration |
| 7 | Authentication and authorisation |
| 8 | Checkout, order creation, inventory validation, and admin tools |
| 9 | Automated tests and bug fixes |
| 10 | Docker and local development environment |
| 11 | GitHub Actions CI |
| 12 | Deployment planning and portfolio documentation |
| 13 | Optional future cloud and DevOps improvements |

Do not try to implement every feature in a single enormous change. Keep each milestone testable.

---

## 14. Environment and spending restrictions

- Start locally. Use sample data and local development services.
- Do not create cloud resources, enable paid APIs, purchase a domain, connect real payments, or incur costs without explicit approval.
- Explain any commands that could delete files, reset data, or change external services before running them.
- Avoid destructive actions without approval.

---

## 15. AI agent working rules

### Before editing

- Inspect the current workspace.
- Read this specification.
- Identify existing files and avoid overwriting useful work.
- Explain the immediate task and proposed changes.

### During implementation

- Work directly in the project files.
- Use JavaScript only.
- Make focused changes.
- Explain unfamiliar commands and important code decisions.
- Ask before major architectural changes or destructive operations.
- Do not invent credentials, API keys, business data, or deployment results.

### After implementation

- Run appropriate lint, tests, and build checks.
- Report exactly which checks passed and failed.
- Identify anything not tested.
- Summarise files created or changed.
- Give the next concrete step.

---

## 16. Definition of done

The project is complete when:

- [ ] The responsive website supports browsing, search, categories, cart, demo checkout, authentication, customer orders, admin product and inventory management, and order status updates.
- [ ] Backend validation, database persistence, and authorisation are in place.
- [ ] Automated tests pass.
- [ ] CI pipeline is green.
- [ ] Docker-based local development works.
- [ ] Setup documentation is complete.
- [ ] An honest portfolio README is in place.

Do not claim the application is production-ready or deployed unless that has been verified.

---

## 17. Change log

| Date | Change | Author |
|---|---|---|
| 2026-10-19 | Initial specification created from master project prompt | Agent |
