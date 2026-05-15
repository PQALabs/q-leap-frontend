# Re-declare ARG after FROM (Docker scope requirement)
ARG NODE_IMAGE=node:24.14.0-alpine3.23

###################### BUILD STAGE ########################
FROM $NODE_IMAGE AS builder

# NEXT_PUBLIC_* variables are inlined into the browser JS bundle at BUILD TIME by Next.js.
# Feature flags (ENABLE_TESTNET, ENABLE_FORUM, ENABLE_LIQUIDATION) are intentionally NOT
# build args — they are plain env vars injected at runtime via Kubernetes ConfigMap,
# allowing the same image to be deployed across environments without rebuilding.
ARG NEXT_PUBLIC_API_URL=/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# BACKEND_INTERNAL_URL is read by next.config.ts rewrites() at BUILD TIME.
# next build evaluates rewrites() once and freezes the destination URL into
# the standalone output — runtime env injection via ConfigMap is too late.
# Default matches the Kubernetes Service name (q-leap-backend).
ARG BACKEND_INTERNAL_URL=http://q-leap-backend
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL

# Enable pnpm via corepack (ships with Node 16+, no extra install needed).
# Pin pnpm because pnpm@latest may require a newer Node version than NODE_IMAGE.
RUN corepack enable && corepack prepare pnpm@10 --activate

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
