###################### BUILD STAGE ########################
FROM node:24.14.0-alpine3.23 AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG NEXT_PUBLIC_ENABLE_TESTNET
ENV NEXT_PUBLIC_ENABLE_TESTNET=$NEXT_PUBLIC_ENABLE_TESTNET
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

###################### DEPS STAGE ########################
FROM node:24.14.0-alpine3.23 AS deps

RUN npm install -g pnpm

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod && pnpm store prune

###################### FINAL STAGE ########################
FROM alpine:3.23 AS runner

RUN apk upgrade --no-cache \
  && apk add --no-cache dumb-init

# Copy only the node binary — no npm/yarn/corepack
COPY --from=builder /usr/local/bin/node /usr/local/bin/

WORKDIR /app

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
CMD ["node", "server.js"]s