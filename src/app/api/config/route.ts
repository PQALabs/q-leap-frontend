import { NextResponse } from 'next/server';

/**
 * GET /api/config
 *
 * Serves runtime feature flags to the client.
 * These are NEXT_PUBLIC_ env vars injected by the Kubernetes ConfigMap,
 * so the same Docker image works across all environments — flags are controlled
 * entirely by Helm values without rebuilding.
 *
 * Env vars read here (set via ConfigMap → pod env):
 *   NEXT_PUBLIC_ENABLE_TESTNET      — "true" | "false"  (default: "false")
 *   NEXT_PUBLIC_ENABLE_FORUM        — "true" | "false"  (default: "false")
 *   NEXT_PUBLIC_ENABLE_LIQUIDATION  — "true" | "false"  (default: "false")
 */
export async function GET() {
  const config = {
    ENABLE_TESTNET: (process.env.NEXT_PUBLIC_ENABLE_TESTNET ?? 'false') === 'true',
    ENABLE_FORUM: (process.env.NEXT_PUBLIC_ENABLE_FORUM ?? 'false') === 'true',
    ENABLE_LIQUIDATION: (process.env.NEXT_PUBLIC_ENABLE_LIQUIDATION ?? 'false') === 'true',
  };

  return NextResponse.json(config, {
    headers: {
      // Don't cache — always reflect the current ConfigMap values
      'Cache-Control': 'no-store',
    },
  });
}
