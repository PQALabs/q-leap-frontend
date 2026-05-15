import { NextResponse } from 'next/server';

/**
 * GET /api/config
 *
 * Serves runtime feature flags to the client.
 * These are plain (non-NEXT_PUBLIC_) env vars injected by the Kubernetes ConfigMap.
 * Plain env vars are read server-side at request time — they are NOT inlined by
 * Next.js at build time, so the same Docker image works across all environments.
 *
 * IMPORTANT: Do NOT use NEXT_PUBLIC_ prefix here. NEXT_PUBLIC_ vars are compiled
 * into the JS bundle at build time and cannot be overridden at runtime via ConfigMap.
 *
 * Env vars read here (set via ConfigMap → pod env):
 *   ENABLE_TESTNET      — "true" | "false"  (default: "false")
 *   ENABLE_FORUM        — "true" | "false"  (default: "false")
 *   ENABLE_LIQUIDATION  — "true" | "false"  (default: "false")
 */
export async function GET() {
  const config = {
    ENABLE_TESTNET: (process.env.ENABLE_TESTNET ?? 'false') === 'true',
    ENABLE_FORUM: (process.env.ENABLE_FORUM ?? 'false') === 'true',
    ENABLE_LIQUIDATION: (process.env.ENABLE_LIQUIDATION ?? 'false') === 'true',
  };

  return NextResponse.json(config, {
    headers: {
      // Don't cache — always reflect the current ConfigMap values
      'Cache-Control': 'no-store',
    },
  });
}
