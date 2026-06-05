# Infrastructure, Deployment & DevOps

> **Version:** 1.0.0 | **Last updated:** 2026-06-02
> **Scope:** `q-leap-frontend` — Kubernetes / ArgoCD / Kargo GitOps pipeline

---

## Table of Contents

1. [Infrastructure Overview](#1-infrastructure-overview)
2. [Docker Build](#2-docker-build)
3. [CI/CD Pipeline](#3-cicd-pipeline)
4. [Environment Variable Reference](#4-environment-variable-reference)
5. [Deployment Procedures](#5-deployment-procedures)
6. [Known Issues & Technical Debt](#6-known-issues--technical-debt)

---

## 1. Infrastructure Overview

```
GitHub Repository
      │
      │  push to main / tag
      ▼
GitHub Actions (CI)
  ├── Unit tests (vitest)
  ├── Docker image build
  └── Docker image push → Container Registry
              │
              │  image tag update
              ▼
        Kargo / ArgoCD
              │
              │  GitOps sync
              ▼
      Kubernetes Cluster
        ├── q-leap-frontend  (Next.js pod — public Ingress)
        ├── q-leap-backend   (API pod — ClusterIP only)
        └── ConfigMap        (runtime feature flags)
```

The frontend is the **only publicly exposed service**. The backend has no public Ingress; the frontend proxies all API traffic server-side via Next.js rewrites.

---

## 2. Docker Build

### Dockerfile location

```
docker/Dockerfile
```

### Multi-stage build

| Stage | Base image | Purpose |
|-------|-----------|---------|
| `builder` | `node:24.14.0-alpine` | Install deps + `pnpm build` (Next.js standalone output) |
| `runner` | `node:24.14.0-alpine` | Minimal runtime — copies only `.next/standalone`, `.next/static`, `public/` |

The runner stage runs as a non-root user (`app_user` UID 1001) and uses `dumb-init` for proper signal handling in Kubernetes.

### Build commands

```bash
# Local build
docker build -f docker/Dockerfile -t q-leap-frontend .

# Local run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=/api/v1 \
  -e BACKEND_INTERNAL_URL=http://localhost:3001 \
  q-leap-frontend
```

### Build-time args baked into the bundle

These must be provided at `docker build` time — they cannot be changed at runtime:

| Variable | Example value | Note |
|----------|--------------|-------|
| `NEXT_PUBLIC_API_URL` | `/api/v1` | Relative path — browser never sees backend hostname |
| `BACKEND_INTERNAL_URL` | `http://q-leap-backend` | Server-side only; not `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_AUTH_LOGIN_MESSAGE` | `Sign in to QLEAP Address: {address} Nonce: {nonce}` | EVM sign message template |

---

## 3. CI/CD Pipeline

### GitHub Actions Workflows

#### `ci.yaml` — Pull Request validation

Triggered on: pull requests targeting `main` or `develop`.

| Step | Command | Notes |
|------|---------|-------|
| Setup pnpm | `pnpm/action-setup@v4` | Version 10.26.2 — pinned |
| Setup Node.js | `actions/setup-node@v4` | Node 20; uses pnpm cache |
| Install deps | `pnpm install --frozen-lockfile` | Fails if lockfile is out of sync |
| Unit tests | `pnpm test:run` | Vitest — single run, no watch |
| Docker build | `docker/build-push-action@v6` | Build only, no push; verifies Dockerfile integrity |
| ~~Trivy scan~~ | ~~Disabled~~ | **TODO:** Re-enable after resolving `picomatch` CVE-2026-33671 |

#### `lint.yml` — Code quality

Runs Biome linting and formatting checks.

#### `docker-publish.yml` — Image publish

Triggered on merge to `main`. Builds and pushes the Docker image to the container registry.

#### `release.yaml` — Semantic release

Automated versioning and changelog generation based on Conventional Commits.

### Pre-commit Hooks (Husky + lint-staged)

Configured in `.husky/pre-commit` and `package.json`:

```json
"lint-staged": {
  "*.{js,ts,jsx,tsx,json}": ["biome check --write --no-errors-on-unmatched"]
}
```

Blocks commits that fail Biome lint/format checks.

### Commit Message Format

Enforced by `commitlint` — must follow Conventional Commits:

```
<type>(<scope>): <subject>

Types: feat | fix | docs | style | refactor | test | chore | perf
```

---

## 4. Environment Variable Reference

### Complete variable table

| Variable | Build-time | Runtime | Required | Default | Description |
|----------|-----------|---------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | — | Yes | — | API base URL (relative `/api/v1` in production) |
| `BACKEND_INTERNAL_URL` | ✅ | — | No | `http://q-leap-backend` | Internal cluster URL for server-side rewrites |
| `NEXT_PUBLIC_AUTH_LOGIN_MESSAGE` | ✅ | — | No | See `.env.example` | EVM message template for wallet sign-in |
| `ENABLE_TESTNET` | — | ✅ | No | `false` | Show QDay Testnet in network selector |
| `ENABLE_FORUM` | — | ✅ | No | `false` | Enable forum module |
| `ENABLE_LIQUIDATION` | — | ✅ | No | `false` | Enable liquidation dashboard |

**Build-time** variables are baked into the JavaScript bundle at `docker build` time.
**Runtime** variables are injected via Kubernetes ConfigMap → pod env vars → read at `/api/config`.

### `.env.example`

```env
# Backend API URL — use relative path in production (Kubernetes)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Internal cluster URL for Next.js server-side rewrites (server only, not NEXT_PUBLIC_)
BACKEND_INTERNAL_URL=http://q-leap-backend

# Feature flags (overridden by Kubernetes ConfigMap in production)
NEXT_PUBLIC_ENABLE_TESTNET=true
NEXT_PUBLIC_ENABLE_LIQUIDATION=true
NEXT_PUBLIC_ENABLE_FORUM=true

# EVM sign-in message template
NEXT_PUBLIC_AUTH_LOGIN_MESSAGE="Sign in to QLEAP Address: {address} Nonce: {nonce}"
```

---

## 5. Deployment Procedures

### Deploying a new version

1. Merge PR to `main` — CI tests must pass.
2. `docker-publish.yml` builds and pushes image with the new Git SHA tag.
3. Kargo detects the new image tag and promotes it through staging → production environments.
4. ArgoCD syncs the Kubernetes deployment — rolling update with zero downtime.

### Rolling back

1. Identify the previous working image tag from the container registry or Git history.
2. Update the Helm values / Kargo configuration to pin the previous image tag.
3. ArgoCD re-syncs — rolling update to the previous image.

### Updating runtime feature flags

Feature flags do not require a new image build:

1. Edit the Kubernetes ConfigMap for the target environment.
2. Restart the frontend pods to pick up the new env vars (`kubectl rollout restart deployment/q-leap-frontend`).

### Adding a new environment variable

- **Build-time** (`NEXT_PUBLIC_*`): Add to `.env.example`, Dockerfile build args, and CI workflow.
- **Runtime**: Add to Kubernetes ConfigMap and the `/api/config` route handler (`src/app/api/config/route.ts`).

---

## 6. Known Issues & Technical Debt

| Issue | Severity | Notes |
|-------|----------|-------|
| Trivy CVE scan disabled | High | `picomatch` CVE-2026-33671 — re-enable after package update |
| JWT in localStorage | Medium | Vulnerable to XSS; migrate to HttpOnly cookie |
| No multi-sig for protocol admin | High | Single-key admin on LendingPoolAddressProvider — must add Safe before full Mainnet launch |
| UniswapV3RepayAdapter not on Mainnet | Medium | Repay-with-collateral feature unavailable on Mainnet |
| WalletConnect disabled | Low | Connector commented out in `wagmi-config.ts` — re-enable if mobile support needed |
| UIPoolDataProviderV2 address not hardcoded | Low | Address must be derived from AddressProvider at runtime — verify this works on both chains |
