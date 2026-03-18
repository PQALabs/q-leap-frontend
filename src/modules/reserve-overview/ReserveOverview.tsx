'use client';

import { ArrowLeft, Check, Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { CompactNumber } from '@/components/compact-number';
import { getDisplayName } from '@/config/token-display';
import { getTokenLogoUrl } from '@/config/token-logos';
import { cn } from '@/lib/utils';
import { valueToBigNumber } from '@/math-utils';
import { usePoolDataStore } from '@/stores/use-pool-data-store';
import { ReserveActions } from './components/ReserveActions';
import { ReserveOverviewSkeleton } from './components/ReserveOverviewSkeleton';
import { ReserveStatusConfig } from './components/ReserveStatusConfig';
import { UserPositionSummary } from './components/UserPositionSummary';

// ---------------------------------------------------------------------------
// Copy button
// ---------------------------------------------------------------------------
function CopyButton({ text, title }: { text: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      type='button'
      onClick={handleCopy}
      className='inline-flex cursor-pointer items-center text-muted-foreground/60 transition-colors hover:text-foreground'
      title={title}
    >
      {copied ? <Check size={14} className='text-emerald-500' /> : <Copy size={14} />}
    </button>
  );
}

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

function getIconBg(symbol: string): string {
  let hash = 0;
  for (const ch of symbol) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return ICON_COLORS[Math.abs(hash) % ICON_COLORS.length];
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function ReserveOverview() {
  const tCommon = useTranslations('common');
  const t = useTranslations('modules.market.ReserveOverview');
  const router = useRouter();
  const searchParams = useSearchParams();
  const underlyingAsset = searchParams.get('underlyingAsset')?.toLowerCase() ?? '';

  const isLoading = usePoolDataStore.use.isLoading();
  const reserves = usePoolDataStore.use.reserves();
  const user = usePoolDataStore.use.user();
  const userId = usePoolDataStore.use.userId();
  const marketRefPriceInUsd = usePoolDataStore.use.marketRefPriceInUsd();
  const networkConfig = usePoolDataStore.use.networkConfig();

  const reserve = useMemo(
    () => reserves.find((r) => r.underlyingAsset.toLowerCase() === underlyingAsset),
    [reserves, underlyingAsset]
  );

  // Compute USD values
  const { totalSuppliedUsd, totalBorrowedUsd, availableLiquidityUsd, priceUsd } = useMemo(() => {
    if (!reserve) return { totalSuppliedUsd: 0, totalBorrowedUsd: 0, availableLiquidityUsd: 0, priceUsd: 0 };

    const price = valueToBigNumber(reserve.priceInMarketReferenceCurrency).multipliedBy(marketRefPriceInUsd);

    return {
      totalSuppliedUsd: price.multipliedBy(reserve.totalLiquidity).toNumber(),
      totalBorrowedUsd: price.multipliedBy(reserve.totalDebt).toNumber(),
      availableLiquidityUsd: price.multipliedBy(reserve.availableLiquidity).toNumber(),
      priceUsd: price.toNumber(),
    };
  }, [reserve, marketRefPriceInUsd]);

  const utilizationRate = reserve ? Number(reserve.utilizationRate) * 100 : 0;
  const explorerLink = networkConfig?.explorerLink;

  // Loading state
  if (isLoading) return <ReserveOverviewSkeleton />;

  // Not found
  if (!reserve) {
    return (
      <main className='mx-auto flex w-full max-w-7xl flex-col items-center gap-4 py-20'>
        <p className='font-medium text-foreground'>{t('reserveNotFound')}</p>
        <p className='text-muted-foreground text-sm'>{t('reserveNotFoundHint')}</p>
        <Link href='/' className='mt-4 inline-flex items-center gap-1 text-primary text-sm hover:underline'>
          <ArrowLeft size={14} /> {tCommon('back')}
        </Link>
      </main>
    );
  }

  const logoUrl = getTokenLogoUrl(reserve.symbol);
  const tokenExplorerUrl = explorerLink ? `${explorerLink}/address/${reserve.underlyingAsset}` : undefined;

  return (
    <main className='mx-auto flex w-full max-w-7xl flex-col gap-6 pt-0 pb-8 md:pt-8'>
      {/* ── Back button ── */}
      <button
        type='button'
        onClick={() => router.back()}
        className='inline-flex w-fit cursor-pointer items-center gap-1 text-muted-foreground text-sm transition-colors hover:text-foreground'
      >
        <ArrowLeft size={14} /> {tCommon('back')}
      </button>

      {/* ── Top Header Bar ── */}
      <div className='flex flex-wrap items-center gap-6'>
        {/* Token identity */}
        <div className='flex items-center gap-3'>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={reserve.symbol}
              width={48}
              height={48}
              className='h-12 w-12 shrink-0 rounded-full object-cover'
            />
          ) : (
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold text-lg text-white shadow-sm',
                getIconBg(reserve.symbol)
              )}
            >
              {reserve.symbol.charAt(0)}
            </div>
          )}
          <div>
            <span className='text-muted-foreground text-sm'>{reserve.symbol}</span>
            <div className='flex items-center gap-2'>
              <h1 className='font-bold text-foreground text-xl'>{getDisplayName(reserve.symbol)}</h1>
              {tokenExplorerUrl && (
                <a
                  href={tokenExplorerUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-muted-foreground transition-colors hover:text-foreground'
                >
                  <ExternalLink size={14} />
                </a>
              )}
              <CopyButton text={reserve.underlyingAsset} title='Copy address' />
            </div>
          </div>
        </div>

        {/* Stat pills */}
        <div className='grid grid-cols-2 gap-4 md:ml-auto md:flex md:flex-wrap md:gap-8 lg:gap-16'>
          <StatPill
            label={t('reserveSize')}
            value={
              <>
                $ <CompactNumber value={totalSuppliedUsd} />
              </>
            }
          />
          <StatPill
            label={t('availableLiquidity')}
            value={
              <>
                $ <CompactNumber value={availableLiquidityUsd} />
              </>
            }
          />
          <StatPill label={t('utilizationRate')} value={`${utilizationRate.toFixed(2)}%`} />
          <StatPill
            label={t('oraclePrice')}
            value={
              <span className='flex items-center gap-1'>
                $ {priceUsd.toFixed(2)}
                {explorerLink && (
                  <a
                    href={`${explorerLink}/address/${reserve.underlyingAsset}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-muted-foreground transition-colors hover:text-foreground'
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </span>
            }
          />
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]'>
        {/* Left column */}
        <div className='flex flex-col gap-6'>
          <ReserveStatusConfig
            reserve={reserve}
            totalSuppliedUsd={totalSuppliedUsd}
            totalBorrowedUsd={totalBorrowedUsd}
          />
          <UserPositionSummary reserve={reserve} user={user} isConnected={!!userId} />
        </div>

        {/* Right column */}
        <div className='lg:sticky lg:top-6 lg:self-start'>
          <ReserveActions reserve={reserve} user={user} marketRefPriceInUsd={marketRefPriceInUsd} />
        </div>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Stat pill — used in the top bar
// ---------------------------------------------------------------------------
function StatPill({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex flex-col gap-0.5'>
      <span className='font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>{label}</span>
      <span className='font-bold text-foreground text-lg'>{value}</span>
    </div>
  );
}
