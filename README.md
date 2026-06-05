# q-leap-frontend

Next.js frontend for the Q-Leap DeFi lending platform. Deployed on Kubernetes via ArgoCD + Kargo GitOps.

> **Team reference:** For the full shared CI/CD, branching, and GitOps guide that applies to both `q-leap-frontend` and `q-leap-backend`, see the [Q-Leap Engineering Handbook](#) on Confluence.

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System component diagram, auth spec, data models, user flows, codebase map |
| [docs/NETWORKS_AND_ABIS.md](docs/NETWORKS_AND_ABIS.md) | Smart contract addresses, ABIs, chain configs, interaction patterns |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Docker, CI/CD pipeline, environment variables, deployment procedures |
| [docs/SECURITY_AUDITS/](docs/SECURITY_AUDITS/) | Security audit history and known accepted risks |
| [CHANGELOG_FUTURE.md](CHANGELOG_FUTURE.md) | Current state, feature backlog, architecture decision log |

---

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Testing](#testing)
- [Docker](#docker)
- [API Proxy Architecture](#api-proxy-architecture)
- [Environment Variables](#environment-variables)

---

## Project Structure

```
├── src/
│   ├── app/                  # Next.js App Router pages and layouts
│   ├── components/           # Shared UI components
│   ├── hooks/                # Custom React hooks
│   ├── modules/              # Feature modules (market, reserve-overview, etc.)
│   ├── providers/            # React context providers
│   ├── stores/               # Zustand state stores
│   ├── utils/                # Utility functions (format, math)
│   └── math-utils/           # DeFi math (ray math, formatters)
├── public/                   # Static assets
└── docker/                   # Dockerfile
```

---

## Prerequisites

- Node.js v20+
- pnpm v10.26.2

---

## Local Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Testing

```bash
pnpm test:run       # unit tests — single run (used in CI)
pnpm test           # unit tests — watch mode
pnpm test:coverage  # coverage report
```

---

## Docker

```bash
# Build
docker build -f docker/Dockerfile -t q-leap-frontend .

# Run
docker run -p 3000:3000 q-leap-frontend
```

---

## API Proxy Architecture

The backend (`q-leap-backend`) is a **ClusterIP-only** service with no public ingress. The frontend proxies all API calls server-side so the browser never needs to reach the backend directly.

```
Browser → GET /api/v1/reserves
               ↓  same domain, no CORS
Next.js server pod (inside cluster)
               ↓  rewrites to
http://q-leap-backend/api/v1/reserves
               ↓  cluster DNS — only resolvable inside k8s
Backend pod (ClusterIP, never public)
```

Configured in `next.config.ts`:

```ts
async rewrites() {
  const backendUrl = process.env.BACKEND_INTERNAL_URL ?? 'http://q-leap-backend';
  return [{ source: '/api/v1/:path*', destination: `${backendUrl}/api/v1/:path*` }];
}
```

`NEXT_PUBLIC_API_URL` is set to `/api/v1` (relative path) in the Helm ConfigMap — the browser never sees the internal cluster hostname.

---

## Environment Variables

Copy `.env.example` to `.env`:

```env
NEXT_PUBLIC_API_URL=/api/v1
BACKEND_INTERNAL_URL=http://q-leap-backend
```

`BACKEND_INTERNAL_URL` is only used server-side (Next.js rewrites). It is never exposed to the browser.
