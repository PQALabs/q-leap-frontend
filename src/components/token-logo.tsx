import { getTokenLogoUrl } from '@/config/token-logos';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Deterministic icon background (shared across all modules)
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
// TokenLogo — renders an <img> if a logo URL exists, otherwise a colored
// circle with the first character of the symbol.
// ---------------------------------------------------------------------------
interface TokenLogoProps {
  symbol: string;
  size?: number;
  className?: string;
}

export function TokenLogo({ symbol, size = 32, className }: TokenLogoProps) {
  const url = getTokenLogoUrl(symbol);
  if (url) {
    return (
      <img
        src={url}
        alt={symbol}
        width={size}
        height={size}
        className={cn('shrink-0 rounded-full object-cover', className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-bold text-white',
        getIconBg(symbol),
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {symbol.charAt(0)}
    </div>
  );
}
