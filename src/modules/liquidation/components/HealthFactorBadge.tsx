import { formatHfValue, getHfColor } from '@/lib/format-health-factor';
import { cn } from '@/lib/utils';

export function HealthFactorBadge({ value }: { value: string }) {
  const display = formatHfValue(value);
  const colorClass = getHfColor(display);

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md px-2.5 py-1 font-bold text-sm tabular-nums',
        'border',
        display === '∞'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/40'
          : Number(display) < 1.1
            ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/40'
            : Number(display) < 1.5
              ? 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/40'
              : 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/40',
        colorClass
      )}
    >
      {display}
    </span>
  );
}
