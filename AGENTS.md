# AGENTS.md — AI Agent Working Guide for QuickBasket 2026

This file describes how an AI coding agent should approach the QuickBasket 2026 codebase.
Read this file before making any changes to the project.

---

## 1. Master specification

The authoritative project specification is in [`docs/MASTER_PROJECT_PROMPT.md`](docs/MASTER_PROJECT_PROMPT.md).

Read it before every session. **Never replace the full requirements with a short summary.**

---

## 2. Non-negotiable rules

### Language
- **JavaScript and JSX only.** Never create `.ts`, `.tsx`, `tsconfig.json`, or TypeScript-specific configuration files.
- Use `.js`, `.jsx`, `.mjs`, JSON, Markdown, and YAML as appropriate.

### Monorepo
- This is an **npm workspaces monorepo**.  Three workspaces: `apps/web`, `apps/api`, `packages/shared`.
- Install packages with `npm install <pkg> --workspace=<workspace>` from the repo root.
- Do not run `npm install` inside individual workspace directories.

### Stack
Never introduce a framework, library, or tooling not in the approved stack:

| Layer | Technology |
|---|---|
| Frontend | Next.js App Router |
| State | Redux Toolkit + React Redux |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Testing | Playwright (E2E), Node built-in test runner (unit) |

### No paid services
Do not create cloud resources, purchase domains, connect real payment gateways, or incur costs without explicit approval.

---

## 3. Before editing anything

1. Run `Get-ChildItem -Path . -Force` (or equivalent) to inspect the current workspace.
2. Read the master specification.
3. Identify existing files and **do not overwrite useful work**.
4. Explain the planned changes before making them.
5. Ask for clarification on ambiguous requirements.

---

## 4. Redux rules (ADR-003, ADR-004)

- The Redux store must **never be a shared singleton** across server requests.
  Always use the `makeStore` factory in `apps/web/store/index.js`.
- The `StoreProvider` in `apps/web/store/provider.jsx` is the only Redux-related Client Component at the root level.
- Cart `localStorage` persistence must read storage **only after mount** (in `useEffect`), never during SSR or the initial client render.
- Redux is for **cart state** and **minimal auth identity** only.
  Do not put every API response into Redux.
- The backend is authoritative for prices, stock, permissions, and orders.
  Never trust client-supplied values.

---

## 5. Monetary values (ADR-005)

- All monetary values in the database and API are **integer paise** (₹1 = 100 paise).
- Display conversion to rupees happens only in the frontend using `formatINR(paise)` from `@quickbasket/shared`.
- Every price field is named with the `Paise` suffix (e.g. `pricePaise`, `totalPaise`).

---

## 6. Security rules (MASTER §10)

- Secrets live in `.env` only.  Never commit real credentials.
- Passwords are hashed with **bcryptjs**, cost factor 12.
- JWTs are issued in **httpOnly cookies** (never localStorage).
- All admin API endpoints have server-side role checks — never rely on frontend guards alone.
- Request bodies are validated with `express-validator` before processing.
- Stock is decremented with atomic `$inc` to reduce overselling risks.
- Never trust client-supplied prices, totals, roles, or stock.

---

## 7. Soft-delete (ADR-007)

- Products and categories are **never hard-deleted**.
- Use `active: false` to deactivate a record.
- All public queries must filter `{ active: true }`.

---

## 8. Order item snapshots (ADR-008)

When creating an order, the backend must:
1. Re-fetch each product from the database.
2. Verify it is active and has sufficient stock.
3. Capture `name`, `pricePaise`, `image`, `packageSize`, `slug` as a snapshot in the order document.
4. Decrement stock with `findOneAndUpdate + $inc`.

---

## 9. API conventions

- All endpoints are versioned under `/api/v1`.
- Successful responses: `{ success: true, data: { … } }`.
- Error responses: `{ success: false, message: "…", errors: [] }`.
- HTTP codes: 200, 201, 400, 401, 403, 404, 409, 500.
- Async handlers are wrapped in `asyncHandler` from `apps/api/src/utils/asyncHandler.js`.
- Custom errors use `ApiError` from `apps/api/src/utils/ApiError.js`.

---

## 10. File structure reference

```
apps/
  web/
    app/            # Next.js route segments, layouts, pages
    components/     # Reusable Client Components
    store/          # Redux store, slices, StoreProvider
  api/
    src/
      config/       # env.js, db.js
      models/       # Mongoose schemas
      routes/v1/    # Express routers
      controllers/  # Thin request handlers
      services/     # Business logic
      middleware/   # auth, requireRole, validate, errorHandler
      utils/        # ApiError, asyncHandler
    seed/           # Database seed scripts
packages/
  shared/
    src/
      utils/        # paise.js, slug.js
      validation/   # schemas.js (Zod, Phase 7+)
```

---

## 11. After every implementation session

1. Run `npm run lint` — report which workspaces passed/failed.
2. Run `npm test` — report results or explain why tests don't exist yet.
3. Run `npm run build` — report success or failure with the error.
4. Verify the API health endpoint if the server can start.
5. Summarise files created or changed.
6. State any outstanding issues and the next concrete step.
7. **Do not claim a check passed unless it actually ran and produced output.**

---

## 12. Incremental development

Do not build all features in one session. Follow the phases in [`docs/DEVELOPMENT_PLAN.md`](docs/DEVELOPMENT_PLAN.md).

The current milestone is always the lowest-numbered incomplete phase.

---

## 13. Forbidden actions

- Creating `.ts` or `.tsx` files.
- Hard-deleting products or categories from the database.
- Storing secrets in code or committing `.env`.
- Trusting client-supplied prices or stock values in order creation.
- Running destructive commands (DROP, DELETE all, `rm -rf`) without explicit approval.
- Creating cloud infrastructure without explicit approval.
- Claiming tests pass without running them.
