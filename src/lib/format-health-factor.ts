/**
 * Format health factor for display.
 * Aave returns -1 when there are no borrows → display as ∞.
 */
export function formatHfValue(hf: string | number): string {
  const n = typeof hf === 'string' ? Number(hf) : hf;
  if (Number.isNaN(n)) return hf.toString();
  if (n < 0) return '∞';
  if (n > 10) return '∞';
  return typeof hf === 'number' ? hf.toFixed(2) : hf;
}

/** Get a Tailwind text color class for a health factor value */
export function getHfColor(hf: string): string {
  if (hf === '∞') return 'text-emerald-600';
  const n = Number(hf);
  if (n >= 1.5) return 'text-emerald-600';
  if (n >= 1.1) return 'text-amber-500';
  if (Number.isNaN(n)) return 'text-gray-500';
  return 'text-red-500';
}

/** Get a Tailwind bg color class for a health factor numeric value */
export function getHfBgColor(hf: number): string {
  if (hf < 0) return 'bg-emerald-500'; // no borrows
  if (hf >= 1.5) return 'bg-emerald-500';
  if (hf >= 1.1) return 'bg-amber-400';
  return 'bg-red-500';
}

/** Get a badge label + color for a health factor value */
export function getHealthFactorLabel(hf: number, t?: (key: string) => string): { label: string; color: string } {
  const safe = t ? t('safe') : 'Safe';
  const warning = t ? t('warning') : 'Warning';
  const danger = t ? t('danger') : 'Danger';

  if (hf < 0 || hf >= 1.5)
    return { label: safe, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' };
  if (hf >= 1.1) return { label: warning, color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' };
  return { label: danger, color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' };
}
