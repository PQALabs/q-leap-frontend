/** Format a percentage APY value, showing <0.01% / >-0.01% for near-zero values */
export function formatApy(value: number): string {
  if (value > 0 && value < 0.01) return '<0.01%';
  if (value < 0 && value > -0.01) return '>-0.01%';
  return `${value.toFixed(2)}%`;
}

/**
 * Format a USD value with `$` prefix.
 * Truncates to 2 decimals (no rounding). Uses compact notation for large values.
 *
 * Examples: $0.00, $12.34, $1,234.56, $1.23M, $4.56B
 */
export function formatUsd(val: number | string): string {
  const num = Number(val);
  if (Number.isNaN(num) || num === 0) return '$0.00';
  // Truncate to 2 decimals (no rounding) — e.g. 1234.567 → 1234.56
  const truncated = Math.trunc(num * 100) / 100;
  if (Math.abs(num) >= 1e9) return `$${(Math.trunc((num / 1e9) * 100) / 100).toFixed(2)}B`;
  if (Math.abs(num) >= 1e6) return `$${(Math.trunc((num / 1e6) * 100) / 100).toFixed(2)}M`;
  if (Math.abs(num) >= 1e3)
    return `$${truncated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${truncated.toFixed(2)}`;
}

/**
 * Format a token amount with locale-aware thousand separators.
 *
 * @param value   — numeric value (number or string)
 * @param maxDigits — maximum fraction digits (default 6)
 *
 * Examples: "1,234.5678", "0.001234"
 */
export function formatTokenAmount(value: number | string, maxDigits = 6): string {
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: maxDigits });
}
