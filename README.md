# QuickBasket 2026

> **Portfolio project / demo.** The storefront catalogue is sample data. This repository is under active development; do not use it to process real customer data, payments, or deliveries.

QuickBasket is a grocery storefront concept for Edappal and Vattamkulam, Kerala. It is being built as a full-stack portfolio project with AI integration and a cloud/DevOps delivery pipeline.

## Stack

- **Frontend:** Next.js App Router, React, JavaScript/JSX, Tailwind CSS
- **State:** Redux Toolkit + React Redux
- **Backend:** Node.js + Express REST API
- **Database:** MongoDB + Mongoose dependencies and connection helper (database-backed product/order flows still need implementation and verification)
- **AI:** server-side OpenAI-compatible Chat Completions integration, configured by environment variables
- **DevOps:** Dockerfiles, Docker Compose, Kubernetes learning manifests, GitHub Actions CI
- **Repository:** npm workspaces monorepo

## Current feature status

| Feature | Current status |
|---|---|
| Storefront catalogue, search, categories, sorting | Demo frontend implemented |
| Cart and wishlist | Redux + browser localStorage |
| Product details route | Implemented; verify locally |
| Express API | Health endpoint and AI chat endpoint |
| AI assistant UI | Implemented; requires a configured provider API key |
| MongoDB persistence | Connection helper exists; production product/order flows are not yet complete |
| Real authentication | Not complete; current UI demo identity is not secure authentication |
| Order checkout and history | Not complete |
| Payment gateway | Not integrated |
| Admin/store dashboard | Not complete |
| Docker / Compose | Configured; must be built and tested locally/CI |
| Kubernetes | Starter manifests for local learning; not production-ready |
| GitHub Actions | Lint/test/build/Docker-image workflow; verify run status |
| Public deployment | Not deployed yet |

## Repository structure

```
apps/web/                 Next.js storefront and pages
apps/web/app/             App Router pages (/, /cart, /wishlist, /products/[slug], /assistant)
apps/web/components/      Reusable UI
apps/web/store/           Redux store, cart, wishlist and demo auth state
apps/web/lib/              Demo product data and client-side data service
apps/api/src/              Express app, middleware, API routes and config
packages/shared/           Reusable JavaScript helpers and validation
docs/                      Project requirements, architecture and decisions
k8s/                       Local Kubernetes learning manifests
.github/workflows/ci.yml   CI checks
docker-compose.yml         Local development stack
```

## Local development

Requirements: Node.js 20+, npm 10+, Git. Docker Desktop is needed for Compose/Kubernetes steps.

1. Clone the repository and switch to the feature branch:

   ```bash
   git clone https://github.com/Pranav18s/QuickBasket.git
   cd QuickBasket
   git switch feature/storefront-ui
   ```

2. Install dependencies and configure environment variables:

   ```bash
   npm ci
   cp .env.example .env
   ```

   On Windows PowerShell, use `Copy-Item .env.example .env`. Generate a local JWT secret with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

3. Start the frontend alone:

   ```bash
   npm run dev:web
   ```

   Open http://localhost:3000. To start the Express API in another terminal, run `npm run dev:api`; its health endpoint is http://localhost:5000/api/v1/health.

4. To run the local Docker Compose stack:

   ```bash
   docker compose up --build
   ```

   Frontend: http://localhost:3000  
   API health: http://localhost:5000/api/v1/health

   Stop with `docker compose down`. The MongoDB volume is retained unless explicitly removed.

## AI assistant setup

The AI route is server-side at `POST /api/v1/ai/chat`; the UI is at `/assistant`. It sends requests to an OpenAI-compatible Chat Completions endpoint. Set these in your ignored root `.env` file:

```dotenv
AI_PROVIDER_API_KEY=your_provider_key
AI_PROVIDER_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
```

For Docker Compose, Compose passes these values to the API container. Never put provider keys in `NEXT_PUBLIC_*` variables, frontend source, or Git. Provider usage may cost money. Without a key, the UI should show a clear configuration error.

## CI checks

GitHub Actions is configured to run linting, available unit tests, a Next.js production build, and Docker image builds on feature-branch pushes and pull requests into `main` / `develop`. Check the Actions tab for the actual run results; a workflow file existing in Git is not proof that a run passed.

Run the same main checks locally from the repository root:

```bash
npm ci
npm run lint
npm test
npm run build
docker build -f apps/api/Dockerfile -t quickbasket-api:local .
docker build -f apps/web/Dockerfile -t quickbasket-web:local --build-arg NEXT_PUBLIC_API_URL=http://localhost:5000 .
```

## Kubernetes (local learning)

Starter manifests are in `k8s/`. Read [k8s/README.md](k8s/README.md) before applying them. They are intended for Minikube/local learning, not a public production cluster. For a public deployment, use managed MongoDB with authentication/TLS/backups, TLS ingress, a private database network, external image registry, secure secret management and observability.

## Release workflow

All development work should be committed to `feature/storefront-ui`, tested, pushed, then reviewed in a pull request before merging to `main`. Do not merge until CI passes and the critical flows have been tested in a browser.

## Important limitations

- Sample products/prices/stock are not live shop inventory.
- Cart and wishlist are browser-local; they are not linked to a real account.
- The AI assistant does not place orders or confirm stock.
- Real authentication, persistent orders, admin inventory management, checkout, payment-provider integration, production security review and public hosting are still pending.
