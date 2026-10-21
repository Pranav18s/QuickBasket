# QuickBasket on Kubernetes (local learning environment)

These manifests are for Minikube/Docker Desktop learning only. The MongoDB manifest is a demo single-replica database, not a production architecture.

## 1. Build images for Minikube

Start Minikube first. In PowerShell, configure the Docker CLI to use Minikube's Docker daemon:

```powershell
minikube docker-env --shell powershell | Invoke-Expression
docker build -f apps/api/Dockerfile -t quickbasket-api:local .
docker build -f apps/web/Dockerfile -t quickbasket-web:local --build-arg NEXT_PUBLIC_API_URL=http://quickbasket-api:5000 .
```

Run these commands from the repository root in the same PowerShell window. This makes the local images available to Minikube without pushing them to a registry.

## 2. Create namespace, then secrets

```powershell
kubectl apply -f k8s/namespace.yaml
$jwt = node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
kubectl create secret generic quickbasket-secrets -n quickbasket --from-literal=JWT_SECRET=$jwt --dry-run=client -o yaml | kubectl apply -f -
```

To enable the AI assistant, add your provider key to the Secret (never commit it to Git):

```powershell
kubectl create secret generic quickbasket-secrets -n quickbasket --from-literal=JWT_SECRET=$jwt --from-literal=AI_PROVIDER_API_KEY=YOUR_PROVIDER_KEY --dry-run=client -o yaml | kubectl apply -f -
```

Replace the placeholder locally. If you do not configure a key, the AI endpoint returns a clear configuration error.

## 3. Apply and inspect

```powershell
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/mongo.yaml
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/web-deployment.yaml
kubectl -n quickbasket rollout status deployment/mongo
kubectl -n quickbasket rollout status deployment/quickbasket-api
kubectl -n quickbasket rollout status deployment/quickbasket-web
kubectl -n quickbasket get pods,services
kubectl -n quickbasket port-forward service/quickbasket-web 3000:3000
```

Open http://localhost:3000. In another PowerShell window, check the API:

```powershell
kubectl -n quickbasket port-forward service/quickbasket-api 5000:5000
Invoke-RestMethod http://localhost:5000/api/v1/health
```

## Important notes

- The API currently exposes health and AI chat endpoints; MongoDB product/order persistence is still a future implementation.
- The current storefront catalogue, cart and wishlist still use demo data/browser storage.
- The Next.js rewrite target is configured through `NEXT_PUBLIC_API_URL`; this manifest points it at the in-cluster API service. If you change that value, rebuild the web image and test the rewrite.
- Use managed MongoDB with authentication, TLS, private networking, backups and monitoring for public production hosting.
- Do not expose MongoDB publicly. Do not put API keys in ConfigMaps, image layers, or Git.
