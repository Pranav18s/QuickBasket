# Deployment runbook — QuickBasket 2026

This runbook is for a **portfolio demo**, not a live commercial grocery business. Use test/demo data only. Deploy only after local tests and CI pass.

## Suggested low-cost public demo stack

- **Frontend:** Vercel Hobby for a personal, non-commercial portfolio project, or a Render web service if you prefer one provider.
- **Backend:** Render Node.js web service.
- **Database:** MongoDB Atlas Free cluster.
- **AI:** an OpenAI-compatible provider API key stored only in the backend's environment variables.

Check each provider's current terms and quotas before deploying. Free instances can sleep or have limited resources. Vercel Hobby is for personal/non-commercial use; Render free web services spin down after 15 minutes idle; Atlas Free clusters currently have a 0.5 GB storage limit. See provider documentation for current limits.

## 1. Create MongoDB Atlas database

1. Create a MongoDB Atlas project and Free cluster.
2. Create a database user with a strong unique password.
3. Configure Network Access to allow the backend host. For a quick portfolio test you may need a broad IP rule if the host's outbound IP is dynamic; understand the security trade-off and never use this setup for sensitive production data.
4. Copy the SRV connection string and replace its username/password placeholders. The database name should be `quickbasket`.

## 2. Deploy the API to Render

Create a Web Service from this GitHub repository and select branch `main` only after the feature PR is merged and verified.

- Root directory: repository root
- Runtime: Node
- Build command: `npm ci`
- Start command: `npm run start --workspace=apps/api`
- Health check path: `/api/v1/health`

Set these environment variables in the Render dashboard (never commit secrets):

- `NODE_ENV=production`
- `MONGODB_URI=<your Atlas SRV connection string>`
- `JWT_SECRET=<long random secret generated locally>`
- `JWT_EXPIRES_IN=7d`
- `CORS_ORIGIN=<your frontend URL>`
- `AI_PROVIDER_API_KEY=<optional provider key>`
- `AI_PROVIDER_BASE_URL=https://api.openai.com/v1`
- `AI_MODEL=gpt-4o-mini`

The service uses the platform-provided `PORT`. After deployment, check `https://YOUR-API.onrender.com/api/v1/health`.

## 3. Seed the demo catalogue

From your local PowerShell, after setting the Atlas URI (do not paste it into chat or commit it):

```powershell
$env:MONGODB_URI = "YOUR_ATLAS_CONNECTION_STRING"
npm run seed --workspace=apps/api
```

For the admin account, set `ADMIN_NAME`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` (at least 12 characters) in your local environment and run:

```powershell
npm run seed:admin --workspace=apps/api
```

Both scripts write to the database selected by `MONGODB_URI`. Keep the URI private.

## 4. Deploy the Next.js frontend

For Vercel, import the repository after the PR is merged:

- Framework preset: Next.js
- Root directory: repository root
- Install command: `npm ci`
- Build command: `npm run build --workspace=apps/web`
- Output: leave the platform's Next.js default

Set `NEXT_PUBLIC_API_URL=https://YOUR-API.onrender.com` as a build environment variable so the Next.js rewrite routes `/api/*` to the deployed API. Redeploy after changing it.

Then update the API's `CORS_ORIGIN` to the exact deployed frontend origin and redeploy the API. Use the same frontend domain consistently for cookie-based login.

If using Render for the frontend instead, configure the same root directory and commands, and set `NEXT_PUBLIC_API_URL` to the API's public HTTPS URL.

## 5. Final smoke tests

- `/` renders the catalogue.
- `/products/palakkadan-matta-rice` loads a seeded product.
- Register, sign in, refresh, and sign out.
- Add a seeded product to the basket, submit demo COD checkout, and confirm the order record exists.
- Sign in as the seeded admin and verify stock/order status updates.
- `/assistant` responds only when the AI key is configured.
- Check backend logs for errors and confirm no secrets appear in logs.
- Do not connect real payments until a provider test-mode integration, webhook verification, order idempotency, transactional stock reservation, and security review are implemented.

## Important production gaps

This demo is not production-ready. Before real users or real payments, implement transactional inventory/order creation (replica-set transaction or equivalent), payment provider webhooks and idempotency, CSRF review, email verification/password reset, admin audit logs, database backups, monitoring/alerts, stronger authorization tests, privacy/legal policies, and a real fulfillment process.
