ARG NODE_IMAGE=node:20-alpine

###################### BUILD STAGE ########################
FROM $NODE_IMAGE AS builder

# Re-declare ARGs after FROM (Docker scope requirement)
# NEXT_PUBLIC_ENABLE_TESTNET: controlled by CI — true for develop branch, false for main.
# Set via --build-arg in release.yaml based on the branch being built.
ARG NEXT_PUBLIC_ENABLE_TESTNET=false
ENV NEXT_PUBLIC_ENABLE_TESTNET=$NEXT_PUBLIC_ENABLE_TESTNET

# NEXT_PUBLIC_* variables are inlined into the browser JS bundle at BUILD TIME by Next.js.
# This app fetches all blockchain data via RPC (wagmi/viem) — the axios client using
# NEXT_PUBLIC_API_URL is only called from 'use client' components, never from Server Components
# or SSR paths. There is no SSR hydration risk here.
# The ConfigMap value is therefore irrelevant — it must be set as a build ARG.
ARG NEXT_PUBLIC_API_URL=/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# BACKEND_INTERNAL_URL is read by next.config.ts rewrites() at BUILD TIME.
# next build evaluates rewrites() once and freezes the destination URL into
# the standalone output — runtime env injection via ConfigMap is too late.
# Default matches the Kubernetes Service name (q-leap-backend).
ARG BACKEND_INTERNAL_URL=http://q-leap-backend
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL

# Enable pnpm via corepack (ships with Node 16+, no extra install needed)
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

###################### FINAL STAGE ########################
FROM $NODE_IMAGE AS runner

RUN apk upgrade --no-cache \
  && apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S app_user \
    && adduser -S app_user -u 1001 -G app_user \
    && chown app_user:app_user ./

COPY --from=builder --chown=app_user:app_user /app/.next/standalone ./
COPY --from=builder --chown=app_user:app_user /app/.next/static     ./.next/static
COPY --from=builder --chown=app_user:app_user /app/public           ./public

USER app_user

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
