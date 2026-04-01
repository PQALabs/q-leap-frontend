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
 * @param maxDigits — maximum fraction digits (default 4)
 *
 * Examples: "1,234.5678", "0.0012"
 */
export function formatTokenAmount(value: number | string, maxDigits = 4): string {
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: maxDigits });
}

/**
 * Format a token price in USD with dynamic decimal precision.
 * Adapts decimals based on magnitude so small prices (e.g. QDAY $0.00258)
 * remain readable instead of showing $0.00.
 *
 * | Price range   | Decimals | Example              |
 * |---------------|----------|----------------------|
 * | >= $1         | 2        | $1,234.56            |
 * | $0.01 – $1    | 4        | $0.2086 (WABEL)      |
 * | < $0.01       | 6        | $0.002580 (QDAY)     |
 * | 0             | —        | $0.00                |
 */
export function formatTokenPrice(val: number | string): string {
  const num = Number(val);
  if (Number.isNaN(num) || num === 0) return '$0.00';

  const abs = Math.abs(num);
  let decimals: number;
  if (abs >= 1) decimals = 2;
  else if (abs >= 0.01) decimals = 4;
  else decimals = 6;

  const truncFactor = 10 ** decimals;
  const truncated = Math.trunc(num * truncFactor) / truncFactor;

  if (abs >= 1e9) return `$${(Math.trunc((num / 1e9) * 100) / 100).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(Math.trunc((num / 1e6) * 100) / 100).toFixed(2)}M`;

  return `$${truncated.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}
