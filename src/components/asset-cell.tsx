import Link from 'next/link';
import { getDisplaySymbol } from '@/config/token-display';
import { CopyAddressButton } from './copy-address-button';
import { TokenLogo } from './token-logo';

// ---------------------------------------------------------------------------
// AssetCell — unified token identity cell used in tables and card headers.
//
// Renders: [Logo] [DisplaySymbol]
//                  [DisplayName • 0xAbCd…EfGh] [Copy]
//
// If `href` is provided the entire cell is wrapped in a Next.js <Link>.
// ---------------------------------------------------------------------------
interface AssetCellProps {
  /** On-chain token symbol (e.g. "WABEL") */
  symbol: string;
  name: string;
  /** Full contract address */
  underlyingAsset: string;
  /** Logo / fallback circle diameter in px (default 28) */
  size?: number;
  /** Optional copy-button tooltip text */
  copyTitle?: string;
  /** If provided, wraps the cell in a Next.js Link */
  href?: string;
}

export function AssetCell({
  symbol,
  underlyingAsset,
  size = 28,
  copyTitle = 'Copy address',
  href,
  name,
}: AssetCellProps) {
  const content = (
    <div className='flex items-center gap-2'>
      <TokenLogo symbol={symbol} size={size} />
      <div>
        <div className='font-semibold text-foreground'>{getDisplaySymbol(symbol)}</div>
        <div className='flex items-center gap-1 text-muted-foreground text-xs'>
          {name} • {underlyingAsset.slice(0, 6)}…{underlyingAsset.slice(-4)}
          <CopyAddressButton address={underlyingAsset} title={copyTitle} />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className='flex items-center gap-2 transition-opacity hover:opacity-80'>
        {content}
      </Link>
    );
  }

  return content;
}
