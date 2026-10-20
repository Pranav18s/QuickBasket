# QuickBasket 2026

> **Portfolio demo — not a real grocery service.**
> No real orders, payments, deliveries, or personal data are processed.

QuickBasket 2026 is a full-stack grocery-ordering web application built as a developer portfolio project, targeting the Edappal and Vattamkulam areas of Kerala, India. It demonstrates a complete modern web stack from database to UI.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) |
| Language | JavaScript + JSX (no TypeScript) |
| State management | Redux Toolkit + React Redux |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Package management | npm workspaces (monorepo) |
| Containers | Docker + Docker Compose |
| CI | GitHub Actions |
| Testing | Playwright (E2E, planned Phase 9) |

---

## Project status

| Phase | Name | Status |
|---|---|---|
| 1 | Requirements & Architecture | ✅ Complete |
| 2 | Repository & Scaffold | ✅ Complete |
| 3 | UI Design (Google Stitch) | ⬜ Not started |
| 4 | Frontend Implementation | ⬜ Not started |
| 5 | Redux Store & Cart | 🔄 Partial (slice created) |
| 6 | Express API & MongoDB | ⬜ Not started |
| 7 | Authentication & Authorisation | ⬜ Not started |
| 8 | Checkout, Orders & Admin Tools | ⬜ Not started |
| 9 | Automated Tests | ⬜ Not started |
| 10 | Docker (local dev) | 🔄 Partial (config ready) |
| 11 | GitHub Actions CI | ✅ Workflow created |
| 12 | Deployment & Portfolio Docs | ⬜ Not started |

---

## Prerequisites

| Tool | Minimum version |
|---|---|
| Node.js | 20 LTS |
| npm | 10 |
| Docker | 24 |
| Docker Compose | v2 |
| Git | 2.x |

---

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/QuickBasket-2026.git
cd QuickBasket-2026
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and set:
- `JWT_SECRET` — a long random string (run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)

All other defaults are fine for local development.

### 3. Install dependencies

```bash
npm install
```

This installs dependencies for all three workspaces in one command.

---

## Running locally (without Docker)

You need a MongoDB instance running locally on port `27017`.
The quickest way is to start just MongoDB via Docker:

```bash
docker-compose up mongo -d
```

Then in two separate terminals:

```bash
# Terminal 1 — Express API (port 5000)
npm run dev:api

# Terminal 2 — Next.js frontend (port 3000)
npm run dev:web
```

Or run both together:

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Running locally (with Docker Compose)

This starts all three services (MongoDB, API, Next.js) in containers:

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Next.js frontend | http://localhost:3000 |
| Express API | http://localhost:5000 |
| API health check | http://localhost:5000/api/v1/health |
| MongoDB | mongodb://localhost:27017 |

Stop with `docker-compose down`. Data persists in a named Docker volume (`mongo_data`).

---

## Available scripts

Run from the repo root unless noted.

| Script | Description |
|---|---|
| `npm run dev` | Start both apps concurrently (requires MongoDB) |
| `npm run dev:web` | Next.js dev server only |
| `npm run dev:api` | Express dev server only (nodemon) |
| `npm run build` | Build the Next.js app for production |
| `npm run lint` | Lint all workspaces |
| `npm run test` | Run all configured tests |
| `npm run format` | Format all files with Prettier |

---

## Monorepo layout

```
QuickBasket-2026/
├── apps/
│   ├── web/         # Next.js App Router frontend
│   └── api/         # Express REST API
├── packages/
│   └── shared/      # Pure JS utilities (paise, slug) shared by both apps
├── docs/            # Full project documentation
├── .github/
│   └── workflows/ci.yml
├── docker-compose.yml
├── .env.example
└── package.json     # Root workspace config
```

---

## API quick reference

Base URL: `http://localhost:5000/api/v1`

| Method | Path | Description |
|---|---|---|
| GET | `/health` | API health check |

More endpoints will be added in Phase 6 (Express API & MongoDB).
See [`docs/API.md`](docs/API.md) for the full design.

---

## Documentation

| File | Description |
|---|---|
| [`docs/MASTER_PROJECT_PROMPT.md`](docs/MASTER_PROJECT_PROMPT.md) | Full project specification |
| [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) | Functional & non-functional requirements |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System design and component layout |
| [`docs/API.md`](docs/API.md) | REST API reference |
| [`docs/DEVELOPMENT_PLAN.md`](docs/DEVELOPMENT_PLAN.md) | 13-phase build plan |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Architecture Decision Records |

---

## Limitations and honest notes

- **This is a portfolio demo.** No real products, real orders, or real deliveries exist.
- The database is not yet connected (Phase 6). The API currently responds to `/health` only.
- Cart state is stored in `localStorage` — clearing the browser clears the cart.
- Authentication is not yet implemented (Phase 7).
- No payment gateway is integrated — this is by design (COD demo only).
- Not deployed to any cloud service.

---

## Contributing

This project is a personal portfolio piece and is not accepting external contributions at this time.

---

## Licence

MIT © 2026
