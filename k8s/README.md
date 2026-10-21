# QuickBasket on Kubernetes (local learning environment)

These manifests are for a local Minikube/Docker Desktop portfolio demo. The MongoDB manifest is **not a production database architecture**.

## 1. Build images

From the repository root:

```powershell
docker build -f apps/api/Dockerfile -t quickbasket-api:local .
docker build -f apps/web/Dockerfile -t quickbasket-web:local --build-arg NEXT_PUBLIC_API_URL=http://localhost:5000 .
```

For Minikube, make the images visible to its Docker daemon before building:

```powershell
minikube docker-env | Invoke-Expression
```

Then run both docker build commands again in that same PowerShell window.

## 2. Create the namespace and secret

```powershell
kubectl apply -f k8s/namespace.yaml
kubectl create secret generic quickbasket-secrets -n quickbasket --from-literal=JWT_SECRET="$(node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\")" --dry-run=client -o yaml | kubectl apply -f -
```

Do not commit actual secrets to Git. Add `AI_PROVIDER_API_KEY` to this Kubernetes Secret only when using the AI endpoint.

## 3. Apply the stack

```powershell
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/mongo.yaml
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/web-deployment.yaml
kubectl -n quickbasket rollout status deployment/mongo
kubectl -n quickbasket rollout status deployment/quickbasket-api
kubectl -n quickbasket rollout status deployment/quickbasket-web
kubectl -n quickbasket port-forward service/quickbasket-web 3000:3000
```

Open http://localhost:3000. In another terminal, API health can be checked with:

```powershell
kubectl -n quickbasket port-forward service/quickbasket-api 5000:5000
Invoke-RestMethod http://localhost:5000/api/v1/health
```

## Important networking note

The current Next.js rewrite uses `NEXT_PUBLIC_API_URL` at build time. A browser or server-side Next.js request cannot resolve the Kubernetes-only service name from outside the cluster. For public deployment, configure the frontend's API base URL to the public API URL, or put both behind one ingress/reverse proxy and use a same-origin `/api` route.

For a real public production environment, use managed MongoDB, TLS/Ingress, an image registry, secret management, persistent backups, resource monitoring, and a secure deployment workflow. Do not expose MongoDB publicly.
