/**
 * Runtime feature flags fetched from /api/config on app startup.
 *
 * These replace the NEXT_PUBLIC_ENABLE_* build-time args, allowing the same
 * Docker image to be deployed across environments with flags controlled by
 * Helm values → Kubernetes ConfigMap → pod env vars.
 */
export type RuntimeConfig = {
  ENABLE_TESTNET: boolean;
  ENABLE_FORUM: boolean;
  ENABLE_LIQUIDATION: boolean;
};

const defaults: RuntimeConfig = {
  ENABLE_TESTNET: false,
  ENABLE_FORUM: false,
  ENABLE_LIQUIDATION: false,
};

let _config: RuntimeConfig = { ...defaults };

export async function fetchRuntimeConfig(): Promise<RuntimeConfig> {
  try {
    const res = await fetch('/api/config', { cache: 'no-store' });
    if (!res.ok) throw new Error(`/api/config returned ${res.status}`);
    _config = await res.json();
  } catch (err) {
    console.warn('[runtime-config] Failed to fetch /api/config, using defaults:', err);
    _config = { ...defaults };
  }
  return _config;
}

/** Synchronous accessor — only valid after fetchRuntimeConfig() has resolved. */
export function getRuntimeConfig(): RuntimeConfig {
  return _config;
}
