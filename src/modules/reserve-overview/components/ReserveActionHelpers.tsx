import { getTokenLogoUrl } from '@/config/token-logos';
import { formatHfValue, getHfColor } from '@/lib/format-health-factor';

// ---------------------------------------------------------------------------
// Info Row
// ---------------------------------------------------------------------------
export function InfoRow({ label, value, valueColor }: { label: string; value: React.ReactNode; valueColor?: string }) {
  return (
    <div className='flex items-center justify-between text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      <span className={valueColor ?? 'text-foreground'}>{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Health Factor Display
// ---------------------------------------------------------------------------
export function HealthFactorDisplay({ currentHf, newHf }: { currentHf: string; newHf: string }) {
  const current = formatHfValue(currentHf);
  const next = formatHfValue(newHf);
  return (
    <span className='flex items-center gap-1'>
      <span className={getHfColor(current)}>{current}</span>
      <span className='text-muted-foreground'>→</span>
      <span className={`font-semibold ${getHfColor(next)}`}>{next}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Token icon helper
// ---------------------------------------------------------------------------
export function TokenIcon({ symbol, size = 20 }: { symbol: string; size?: number }) {
  const logoUrl = getTokenLogoUrl(symbol);
  if (logoUrl) {
    return <img src={logoUrl} alt={symbol} width={size} height={size} className='rounded-full object-cover' />;
  }
  return null;
}
