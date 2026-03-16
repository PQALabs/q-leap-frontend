/** Format a percentage APY value, showing <0.01% / >-0.01% for near-zero values */
export function formatApy(value: number): string {
  if (value > 0 && value < 0.01) return '<0.01%';
  if (value < 0 && value > -0.01) return '>-0.01%';
  return `${value.toFixed(2)}%`;
}
