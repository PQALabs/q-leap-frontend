/** Format a percentage APY value, showing <0.01% / >-0.01% for near-zero values */
export function formatApy(value: number): string {
  if (value > 0 && value < 0.01) return '<0.01%';
  if (value < 0 && value > -0.01) return '>-0.01%';
  return `${value.toFixed(2)}%`;
}

// ─── Internal truncation helper ─────────────────────────────────────────────

/** Truncate (floor) `num` to `decimals` decimal places without rounding up. */
function truncate(num: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.trunc(num * factor) / factor;
}

// ─── R1: Token Amount Formatting ────────────────────────────────────────────

/**
 * Format a token balance / amount for display.
 *
 * Rules (per DeFi UI Formatting Guidelines R1):
 *   - ALWAYS TRUNCATE — never round up (e.g. 1.99999 → "1.99999", not "2")
 *   - Standard mode  : max 5 decimals, trailing zeros stripped
 *   - Dust mode      : values < 10^-5 get 3–10 adaptive decimals so they don't
 *                      collapse to "0"
 *   - Near-zero      : values > 0 but below display threshold → "< 0.00001"
 *
 * @param value     — numeric value (number or string)
 * @param maxDigits — max fraction digits for standard mode (default 5 per R1.1)
 */
export function formatTokenAmount(value: number | string, maxDigits = 5): string {
  const num = Number(value);
  if (Number.isNaN(num) || num === 0) return '0';

  const abs = Math.abs(num);
  const NEAR_ZERO_THRESHOLD = 10 ** -maxDigits; // e.g. 0.00001 at maxDigits=5

  // R1.3 — Near-zero prefix: value is > 0 but too small to display
  if (abs > 0 && abs < NEAR_ZERO_THRESHOLD) {
    return `< ${NEAR_ZERO_THRESHOLD.toFixed(maxDigits)}`;
  }

  // R1.2 — Dust / small amount: widen decimals up to 10 to reveal non-zero digits
  if (abs < NEAR_ZERO_THRESHOLD * 1000) {
    // Find minimum decimals needed to show at least 3 significant digits
    const dustDecimals = Math.min(Math.max(-Math.floor(Math.log10(abs)) + 2, 3), 10);
    const truncated = truncate(num, dustDecimals);
    return truncated.toLocaleString(undefined, { maximumFractionDigits: dustDecimals });
  }

  // R1.1 — Standard: truncate to maxDigits, strip trailing zeros via maximumFractionDigits
  const truncated = truncate(num, maxDigits);
  return truncated.toLocaleString(undefined, { maximumFractionDigits: maxDigits });
}

// ─── R2: Compact (Large Number) Formatting ──────────────────────────────────

/**
 * Format a USD value with `$` prefix.
 * Uses compact notation (K/M/B/T) for large numbers.
 *
 * Compact thresholds per R2:
 *   >= 1T   →  T (Trillion)
 *   >= 1B   →  B (Billion)
 *   >= 1M   →  M (Million)
 *   >= 10K  →  K (Thousand)
 *
 * Examples: $0.00, $12.34, $1,234.56, $12.50B
 */
export function formatUsd(val: number | string): string {
  const num = Number(val);
  if (Number.isNaN(num) || num === 0) return '$0.00';

  // R1.3 — near-zero USD
  if (num > 0 && num < 0.01) return '<$0.01';
  if (num < 0 && num > -0.01) return '>-$0.01';

  const abs = Math.abs(num);

  // R2 — Compact notation
  if (abs >= 1e12) return `$${(truncate(num / 1e12, 2)).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(truncate(num / 1e9, 2)).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(truncate(num / 1e6, 2)).toFixed(2)}M`;
  if (abs >= 1e4) return `$${(truncate(num / 1e3, 2)).toFixed(2)}K`;

  // R3 — Standard USD: 2 fixed decimals, truncated
  const t = truncate(num, 2);
  if (abs >= 1e3) return `$${t.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${t.toFixed(2)}`;
}

// ─── R2b: Full USD Formatting (No Compact Notation) ─────────────────────────

/**
 * Format a USD value with `$` prefix WITHOUT compact notation.
 * Always displays the full number with thousand separators.
 *
 * Examples: $0.00, $12.34, $1,234.56, $12,345,678.90
 */
export function formatUsdFull(val: number | string): string {
  const num = Number(val);
  if (Number.isNaN(num) || num === 0) return '$0.00';

  // Near-zero handling (consistent with formatUsd)
  if (num > 0 && num < 0.01) return '<$0.01';
  if (num < 0 && num > -0.01) return '>-$0.01';

  const t = truncate(num, 2);
  return `$${t.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── R3: Token Price in USD ──────────────────────────────────────────────────

/**
 * Format a token price in USD with dynamic decimal precision per R3:
 *
 * | Price range   | Decimals | Example               |
 * |---------------|----------|-----------------------|
 * | >= $1         | 2        | $1,234.56             |
 * | $0.01 – $1    | 4        | $0.2086               |
 * | < $0.01       | 6        | $0.002580             |
 * | 0             | —        | $0.00                 |
 */
export function formatTokenPrice(val: number | string): string {
  const num = Number(val);
  if (Number.isNaN(num) || num === 0) return '$0.00';

  const abs = Math.abs(num);
  // R3 decimal tiers
  const decimals = abs >= 1 ? 2 : abs >= 0.01 ? 4 : 6;
  const t = truncate(num, decimals);

  // Compact for very large prices (e.g. BTC)
  if (abs >= 1e9) return `$${truncate(num / 1e9, 2).toFixed(2)}B`;
  if (abs >= 1e6) return `$${truncate(num / 1e6, 2).toFixed(2)}M`;

  return `$${t.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

// ─── R4: Amount Input Constants ──────────────────────────────────────────────

/**
 * Maximum decimal places allowed in amount inputs across all panels (R4.1).
 * Single source of truth — changing this value propagates to AmountInput's
 * default maxDecimals prop AND all MAX-button handlers via truncateInputAmount().
 */
export const MAX_INPUT_DECIMALS = 6;
