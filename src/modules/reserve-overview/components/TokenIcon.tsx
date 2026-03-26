import { getTokenLogoUrl } from '@/config/token-logos';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Deterministic icon background
// ---------------------------------------------------------------------------
const ICON_COLORS = [
  'bg-indigo-600',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-violet-500',
  'bg-orange-500',
  'bg-teal-500',
];

export function getIconBg(symbol: string): string {
  let hash = 0;
  for (const ch of symbol) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return ICON_COLORS[Math.abs(hash) % ICON_COLORS.length];
}

// ---------------------------------------------------------------------------
// TokenIcon
// ---------------------------------------------------------------------------
export function TokenIcon({ symbol, size = 24 }: { symbol: string; size?: number }) {
  const url = getTokenLogoUrl(symbol);
  if (url) {
    return <img src={url} alt={symbol} width={size} height={size} className='shrink-0 rounded-full object-cover' />;
  }
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-full font-bold text-white', getIconBg(symbol))}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {symbol.charAt(0)}
    </div>
  );
}
