/**
 * Build-time config — values baked into the bundle at `next build`.
 * Do NOT add feature flags here; use getRuntimeConfig() from runtime-config.ts instead.
 */
export const env = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? 'Q-LEAP',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  LENDING_POOL_CONTRACT: process.env.NEXT_PUBLIC_LENDING_POOL_CONTRACT,
  LENDING_POOL_ADDRESS_PROVIDER: process.env.NEXT_PUBLIC_LENDING_POOL_ADDRESS_PROVIDER,
  ENABLE_LIQUIDATION: process.env.NEXT_PUBLIC_ENABLE_LIQUIDATION,
  ENABLE_TESTNET: process.env.NEXT_PUBLIC_ENABLE_TESTNET,
};
