'use client';

import { ArrowLeft, ExternalLink, Loader2, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useWalletClient } from 'wagmi';
import { CompactNumber } from '@/components/compact-number';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getDisplayName } from '@/config/token-display';
import { getTokenLogoUrl } from '@/config/token-logos';
import { getEvmMessage } from '@/lib/get-evm-message';
import { cn } from '@/lib/utils';
import { valueToBigNumber } from '@/math-utils';
import { usePoolDataStore } from '@/stores/use-pool-data-store';
import { ReserveActions } from './components/ReserveActions';
import { ReserveOverviewSkeleton } from './components/ReserveOverviewSkeleton';
import { ReserveStatusConfig } from './components/ReserveStatusConfig';
import { UserPositionSummary } from './components/UserPositionSummary';

// ---------------------------------------------------------------------------
// Token logo helper (reused in dropdown items)
// ---------------------------------------------------------------------------
function TokenIcon({ symbol, size = 24 }: { symbol: string; size?: number }) {
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

// ---------------------------------------------------------------------------
// Add to Wallet dropdown button
// ---------------------------------------------------------------------------
function AddToWalletButton({
  underlyingAsset,
  underlyingSymbol,
  underlyingDecimals,
  aTokenAddress,
  aTokenSymbol,
}: {
  underlyingAsset: string;
  underlyingSymbol: string;
  underlyingDecimals: number;
  aTokenAddress: string;
  aTokenSymbol: string;
}) {
  const t = useTranslations('modules.market.ReserveOverview');
  const [isAdding, setIsAdding] = useState(false);
  const { data: walletClient } = useWalletClient();

  const addToken = async (address: string, symbol: string, decimals: number) => {
    const provider = walletClient?.transport as any;
    if (!provider?.request) {
      toast.error(t('noConnectedWallet'));
      return;
    }

    setIsAdding(true);
    try {
      const wasAdded = await provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address,
            symbol: symbol.slice(0, 11),
            decimals,
          },
        },
      });
      if (wasAdded) {
        toast.success(t('tokenAddedToWallet', { symbol }));
      }
    } catch (error) {
      console.error('Failed to add token to wallet:', error);
      toast.error(t('failedAddToken'), { description: getEvmMessage(error) });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          disabled={isAdding}
          title={t('addTokenToWallet')}
          className='inline-flex size-6 cursor-pointer items-center justify-center rounded-full border border-muted-foreground/30 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-50'
        >
          {isAdding ? <Loader2 size={12} className='animate-spin' /> : <Wallet size={12} />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-52'>
        <DropdownMenuLabel className='text-muted-foreground text-xs'>{t('underlyingToken')}</DropdownMenuLabel>
        <button
          type='button'
          className='flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent'
          onClick={() => addToken(underlyingAsset, underlyingSymbol, underlyingDecimals)}
        >
          <TokenIcon symbol={underlyingSymbol} size={24} />
          <span className='font-medium'>{underlyingSymbol}</span>
        </button>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className='text-muted-foreground text-xs'>{t('aaveAToken')}</DropdownMenuLabel>
        <button
          type='button'
          className='flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent'
          onClick={() => addToken(aTokenAddress, aTokenSymbol, underlyingDecimals)}
        >
          <TokenIcon symbol={underlyingSymbol} size={24} />
          <span className='font-medium'>{aTokenSymbol}</span>
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
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
              {explorerLink && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type='button'
                      title={t('viewOnExplorer')}
                      className='inline-flex size-6 cursor-pointer items-center justify-center rounded-full border border-muted-foreground/30 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground'
                    >
                      <ExternalLink size={12} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start' className='w-56'>
                    <DropdownMenuLabel className='text-muted-foreground text-xs'>{t('contracts')}</DropdownMenuLabel>
                    <a
                      href={`${explorerLink}/address/${reserve.underlyingAsset}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent'
                    >
                      <TokenIcon symbol={reserve.symbol} size={24} />
                      <span className='font-medium'>{reserve.symbol}</span>
                      <span className='ml-auto text-muted-foreground text-xs'>{t('token')}</span>
                    </a>
                    <DropdownMenuSeparator />
                    <a
                      href={`${explorerLink}/address/${reserve.aTokenAddress}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent'
                    >
                      <TokenIcon symbol={reserve.symbol} size={24} />
                      <span className='font-medium'>a{reserve.symbol}</span>
                      <span className='ml-auto text-muted-foreground text-xs'>{t('aTokenLabel')}</span>
                    </a>
                    <DropdownMenuSeparator />
                    <a
                      href={`${explorerLink}/address/${reserve.variableDebtTokenAddress}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent'
                    >
                      <TokenIcon symbol={reserve.symbol} size={24} />
                      <span className='font-medium'>vDebt{reserve.symbol}</span>
                      <span className='ml-auto text-muted-foreground text-xs'>{t('debtToken')}</span>
                    </a>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <AddToWalletButton
                underlyingAsset={reserve.underlyingAsset}
                underlyingSymbol={reserve.symbol}
                underlyingDecimals={reserve.decimals}
                aTokenAddress={reserve.aTokenAddress}
                aTokenSymbol={`a${reserve.symbol}`}
              />
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
