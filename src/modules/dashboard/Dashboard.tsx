'use client';

import { HandCoins, Info, Loader2, PiggyBank, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { useConnection } from 'wagmi';
import { AssetCell } from '@/components/asset-cell';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCollateralToggle } from '@/hooks/use-collateral-toggle';
import { formatHfValue, getHealthFactorLabel, getHfColor } from '@/lib/format-health-factor';
import { cn } from '@/lib/utils';
import type { ComputedUserReserve } from '@/math-utils/formatters/user';
import { usePoolDataStore } from '@/stores/use-pool-data-store';
import { formatApy, formatTokenAmount, formatUsd } from '@/utils/format';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------
function StatCard({ label, tooltip, children }: { label: string; tooltip?: string; children: React.ReactNode }) {
  return (
    <div className='flex flex-1 flex-col gap-2 rounded-xs border border-border bg-card p-5'>
      <span className='flex items-center gap-1 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
        {label}
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='cursor-help'>
                <Info size={12} />
              </span>
            </TooltipTrigger>
            <TooltipContent side='top' className='max-w-[240px] text-xs'>
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </span>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Health Factor Bar (same as UserPositionSummary)
// ---------------------------------------------------------------------------
function HealthFactorBar({ value }: { value: number }) {
  // No borrows (-1) → full bar; otherwise piecewise: HF 0→0%, HF 1→75% (green zone), HF 3+→100%
  const pct = value < 0 ? 100 : value <= 1 ? Math.min(value * 75, 75) : Math.min(75 + ((value - 1) / 2) * 25, 100);

  return (
    <div className='mt-1 h-2 w-full overflow-hidden rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500'>
      <div
        className='h-full rounded-r-full bg-muted transition-all duration-500'
        style={{ width: `${100 - pct}%`, marginLeft: 'auto' }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// LTV Bar
// ---------------------------------------------------------------------------
function LtvBar({ value }: { value: number }) {
  return (
    <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
      <div
        className='h-full rounded-full bg-primary transition-all duration-500'
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Collateral Toggle (interactive switch)
// ---------------------------------------------------------------------------
function CollateralSwitch({
  enabled,
  onClick,
  disabled,
  busy,
  tooltipText,
}: {
  enabled: boolean;
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  tooltipText?: string;
}) {
  const toggle = (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled || busy}
      className={cn(
        'relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full border transition-colors',
        enabled
          ? 'border-emerald-500 bg-emerald-500 dark:border-emerald-400 dark:bg-emerald-500'
          : 'border-muted-foreground/30 bg-muted dark:border-muted-foreground/40 dark:bg-muted-foreground/20',
        (disabled || busy) && 'cursor-not-allowed opacity-50'
      )}
    >
      {busy ? (
        <Loader2 size={12} className='mx-auto animate-spin text-white' />
      ) : (
        <div
          className={cn(
            'size-3.5 rounded-full bg-white shadow-sm transition-transform',
            enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
          )}
        />
      )}
    </button>
  );

  if (tooltipText) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{toggle}</TooltipTrigger>
        <TooltipContent side='top' className='max-w-[220px] text-xs'>
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    );
  }

  return toggle;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export function Dashboard() {
  const t = useTranslations('modules.market.Dashboard');
  const { address } = useConnection();
  const isLoading = usePoolDataStore.use.isLoading();
  const user = usePoolDataStore.use.user();
  const reserves = usePoolDataStore.use.reserves();
  const refresh = usePoolDataStore.use.refresh();

  // ── Collateral toggle ──
  const collateralToggle = useCollateralToggle({
    onSuccess: () => refresh(),
  });

  // ── Derived data ──
  const {
    suppliedReserves,
    borrowedReserves,
    totalSupplyUsd,
    totalBorrowUsd,
    netWorth,
    healthFactor,
    ltv,
    netApy,
    supplyApy,
    totalCollateralUsd,
    borrowApy,
    borrowPowerUsed,
  } = useMemo(() => {
    if (!user)
      return {
        suppliedReserves: [] as ComputedUserReserve[],
        borrowedReserves: [] as ComputedUserReserve[],
        totalSupplyUsd: 0,
        totalBorrowUsd: 0,
        netWorth: 0,
        healthFactor: 0,
        ltv: 0,
        netApy: null as string | null,
        supplyApy: null as string | null,
        totalCollateralUsd: 0,
        borrowApy: null as string | null,
        borrowPowerUsed: 0,
      };

    const supplied = user.userReservesData.filter((ur) => Number(ur.underlyingBalance) > 0);
    const borrowed = user.userReservesData.filter((ur) => Number(ur.totalBorrows) > 0);

    const totalSupply = Number(user.totalCollateralUSD);
    const totalBorrow = Number(user.totalBorrowsUSD);

    // Compute weighted net APY
    let weightedSupplyApy = 0;
    let weightedBorrowApy = 0;
    for (const ur of user.userReservesData) {
      const r = reserves.find((res) => res.underlyingAsset.toLowerCase() === ur.reserve.underlyingAsset.toLowerCase());
      if (!r) continue;
      weightedSupplyApy += Number(ur.underlyingBalanceUSD) * Number(r.supplyAPY);
      weightedBorrowApy += Number(ur.totalBorrowsUSD) * Number(r.variableBorrowAPY);
    }
    const netApyValue = totalSupply > 0 ? ((weightedSupplyApy - weightedBorrowApy) / totalSupply) * 100 : 0;
    const netApyStr = totalSupply > 0 || totalBorrow > 0 ? formatApy(netApyValue) : null;

    return {
      suppliedReserves: supplied,
      borrowedReserves: borrowed,
      totalSupplyUsd: totalSupply,
      totalBorrowUsd: totalBorrow,
      netWorth: totalSupply - totalBorrow,
      healthFactor: Number(user.healthFactor),
      ltv: totalSupply > 0 ? (totalBorrow / totalSupply) * 100 : 0,
      netApy: netApyStr,
      supplyApy: totalSupply > 0 ? formatApy((weightedSupplyApy / totalSupply) * 100) : null,
      totalCollateralUsd: user.userReservesData.reduce((sum, ur) => {
        if (ur.usageAsCollateralEnabledOnUser) return sum + Number(ur.underlyingBalanceUSD);
        return sum;
      }, 0),
      borrowApy: totalBorrow > 0 ? formatApy((weightedBorrowApy / totalBorrow) * 100) : null,
      borrowPowerUsed:
        Number(user.availableBorrowsUSD) + totalBorrow > 0
          ? (totalBorrow / (Number(user.availableBorrowsUSD) + totalBorrow)) * 100
          : 0,
    };
  }, [user, reserves]);

  // Helper to get APY for a user reserve
  const getSupplyApy = (ur: ComputedUserReserve) => {
    const r = reserves.find((res) => res.underlyingAsset.toLowerCase() === ur.reserve.underlyingAsset.toLowerCase());
    return r ? (Number(r.supplyAPY) * 100).toFixed(2) : '0.00';
  };

  const getBorrowApy = (ur: ComputedUserReserve) => {
    const r = reserves.find((res) => res.underlyingAsset.toLowerCase() === ur.reserve.underlyingAsset.toLowerCase());
    return r ? (Number(r.variableBorrowAPY) * 100).toFixed(2) : '0.00';
  };

  // ── Loading / Not connected ──
  if (isLoading) {
    return (
      <main className='mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:py-10'>
        {/* Header */}
        <Skeleton className='h-8 w-48' />

        {/* Stat cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='flex flex-col gap-3 rounded-xs border border-border bg-card p-5'>
              <Skeleton className='h-3 w-24' />
              <Skeleton className='h-8 w-32' />
              <Skeleton className='h-2 w-full' />
            </div>
          ))}
        </div>

        {/* Supplies section */}
        <div className='flex flex-col gap-3'>
          <div className='flex items-center gap-3'>
            <Skeleton className='h-6 w-36' />
            <Skeleton className='h-6 w-32 rounded-md' />
          </div>
          <div className='rounded-xs border border-border'>
            <div className='flex gap-4 border-border border-b bg-muted/30 px-4 py-3'>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className='h-3 w-16' />
              ))}
            </div>
            {[1, 2].map((i) => (
              <div key={i} className='flex items-center gap-4 border-border border-b bg-card px-4 py-3 last:border-b-0'>
                <Skeleton className='h-7 w-7 rounded-full' />
                <Skeleton className='h-4 w-16' />
                <Skeleton className='ml-auto h-4 w-20' />
                <Skeleton className='h-4 w-12' />
                <Skeleton className='h-5 w-9 rounded-full' />
                <Skeleton className='h-8 w-32' />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Borrows section */}
        <div className='flex flex-col gap-3'>
          <div className='flex items-center gap-3'>
            <Skeleton className='h-6 w-36' />
            <Skeleton className='h-6 w-40 rounded-md' />
          </div>
          <div className='rounded-xs border border-border'>
            <div className='flex gap-4 border-border border-b bg-muted/30 px-4 py-3'>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className='h-3 w-16' />
              ))}
            </div>
            {[1, 2].map((i) => (
              <div key={i} className='flex items-center gap-4 border-border border-b bg-card px-4 py-3 last:border-b-0'>
                <Skeleton className='h-7 w-7 rounded-full' />
                <Skeleton className='h-4 w-16' />
                <Skeleton className='ml-auto h-4 w-20' />
                <Skeleton className='h-4 w-12' />
                <Skeleton className='h-8 w-32' />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!address) {
    return (
      <main className='mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 py-20'>
        <Wallet size={48} className='text-muted-foreground' />
        <h2 className='font-bold text-2xl'>{t('connectWalletTitle')}</h2>
        <p className='text-muted-foreground'>{t('connectWalletDescription')}</p>
      </main>
    );
  }

  const hfDisplay = formatHfValue(healthFactor);
  const hfMeta = getHealthFactorLabel(healthFactor);
  const hfColor = getHfColor(hfDisplay);

  return (
    <main className='mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:py-10'>
      {/* ── Header ── */}
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <div>
            <h1 className='font-bold text-2xl text-foreground'>{t('title')}</h1>
            <p className='text-muted-foreground text-sm'>{t('subtitle')}</p>
          </div>
        </div>
      </div>

      <Separator />
      {/* ── Stats Cards ── */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <StatCard label={t('netWorth')} tooltip={t('netWorthTooltip')}>
          <span className='font-bold text-3xl text-foreground'>{formatUsd(netWorth)}</span>
        </StatCard>

        <StatCard label={t('netApy')} tooltip={t('netApyTooltip')}>
          <span
            className={cn(
              'font-bold text-3xl',
              netApy && !netApy.startsWith('>-') && !netApy.startsWith('-') ? 'text-success' : 'text-foreground'
            )}
          >
            {netApy ?? '—'}
          </span>
        </StatCard>

        <StatCard label={t('healthFactor')} tooltip={t('healthFactorTooltip')}>
          <div className='flex items-baseline gap-2'>
            <span className={cn('font-bold text-3xl', hfColor)}>{hfDisplay}</span>
            <span className={cn('rounded-md px-2 py-0.5 font-semibold text-[10px] uppercase', hfMeta.color)}>
              {hfMeta.label}
            </span>
          </div>
          {healthFactor > 0 && Number.isFinite(healthFactor) && <HealthFactorBar value={healthFactor} />}
        </StatCard>

        <StatCard label={t('currentLtv')} tooltip={t('currentLtvTooltip')}>
          <span className='font-bold text-3xl text-foreground'>{totalBorrowUsd > 0 ? `${ltv.toFixed(0)}%` : '0%'}</span>
          <LtvBar value={ltv} />
        </StatCard>
      </div>

      {/* ── Your Supplies ── */}
      <section className='flex flex-col gap-3'>
        <div className='flex flex-wrap items-center gap-3'>
          <h2 className='font-bold text-foreground text-xl'>{t('yourSupplies')}</h2>
          <span className='rounded-md border border-border px-3 py-1 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
            {t('balance')} {formatUsd(totalSupplyUsd)}
          </span>
          <span className='rounded-md border border-border px-3 py-1 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
            {t('apy')} {supplyApy ?? '—'}
          </span>
          <span className='rounded-md border border-border px-3 py-1 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
            {t('collateral')} {formatUsd(totalCollateralUsd)}
          </span>
        </div>

        {suppliedReserves.length === 0 ? (
          <Empty className='rounded-xs border border-border bg-card'>
            <EmptyMedia variant='icon'>
              <PiggyBank size={20} />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{t('noSuppliesTitle')}</EmptyTitle>
              <EmptyDescription>{t('noSuppliesDescription')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className='overflow-x-auto rounded-xs border border-border'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-border border-b bg-muted/30'>
                  <th className='px-4 py-3 text-left font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
                    {t('asset')}
                  </th>
                  <th className='px-4 py-3 text-left font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
                    {t('balance')}
                  </th>
                  <th className='px-4 py-3 text-left font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
                    {t('apy')}
                  </th>
                  <th className='px-4 py-3 text-left font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
                    {t('collateral')}
                  </th>
                  <th className='px-4 py-3 text-right font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className='bg-card'>
                {suppliedReserves.map((ur) => {
                  const reserveLink = `/reserve-overview?underlyingAsset=${ur.reserve.underlyingAsset}`;
                  return (
                    <tr key={ur.reserve.underlyingAsset} className='border-border border-b last:border-b-0'>
                      <td className='px-4 py-3'>
                        <AssetCell
                          symbol={ur.reserve.symbol}
                          underlyingAsset={ur.reserve.underlyingAsset}
                          copyTitle={t('copyAddress')}
                          href={reserveLink}
                        />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex flex-col'>
                          <span className='font-medium text-foreground'>{formatUsd(ur.underlyingBalanceUSD)}</span>
                          <span className='text-muted-foreground text-xs'>
                            {formatTokenAmount(ur.underlyingBalance, 4)} {ur.reserve.symbol}
                          </span>
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <span className='font-medium text-emerald-600'>{getSupplyApy(ur)}%</span>
                      </td>
                      <td className='px-4 py-3'>
                        {(() => {
                          const poolReserve = reserves.find(
                            (r) => r.underlyingAsset.toLowerCase() === ur.reserve.underlyingAsset.toLowerCase()
                          );
                          const poolSupportsCollateral = poolReserve?.usageAsCollateralEnabled ?? false;

                          // Blocking: pool doesn't support collateral
                          if (!poolSupportsCollateral) {
                            return (
                              <CollateralSwitch
                                enabled={false}
                                onClick={() => {}}
                                disabled
                                tooltipText={t('cannotUseAsCollateral')}
                              />
                            );
                          }

                          // Blocking: disabling would drop HF below 1
                          const isCurrentlyEnabled = ur.usageAsCollateralEnabledOnUser;
                          let disableBlocked = false;
                          if (isCurrentlyEnabled && user && Number(user.totalBorrowsMarketReferenceCurrency) > 0) {
                            const totalCollMRC = Number(user.totalCollateralMarketReferenceCurrency);
                            const userBalMRC = Number(ur.underlyingBalanceMarketReferenceCurrency);
                            const collAfter = totalCollMRC - userBalMRC;
                            const liqThreshold = Number(user.currentLiquidationThreshold);
                            const totalBorrowsMRC = Number(user.totalBorrowsMarketReferenceCurrency);
                            const hfAfter = liqThreshold > 0 ? (collAfter * liqThreshold) / totalBorrowsMRC : 0;
                            if (hfAfter < 1) disableBlocked = true;
                          }

                          const isThisAssetBusy =
                            collateralToggle.togglingAsset === ur.reserve.underlyingAsset.toLowerCase();

                          return (
                            <CollateralSwitch
                              enabled={isCurrentlyEnabled}
                              busy={isThisAssetBusy}
                              disabled={isCurrentlyEnabled && disableBlocked}
                              tooltipText={isCurrentlyEnabled && disableBlocked ? t('cannotDisableHf') : undefined}
                              onClick={() => {
                                collateralToggle.toggle(
                                  ur.reserve.underlyingAsset as `0x${string}`,
                                  !isCurrentlyEnabled
                                );
                              }}
                            />
                          );
                        })()}
                      </td>
                      <td className='px-4 py-3 text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button size='sm' variant='outline' asChild>
                            <Link href={`${reserveLink}&action=supply`}>{t('supply')}</Link>
                          </Button>
                          <Button size='sm' variant='ghost' asChild>
                            <Link href={`${reserveLink}&action=supply`}>{t('withdraw')}</Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Separator />

      {/* ── Your Borrows ── */}
      <section className='flex flex-col gap-3'>
        <div className='flex flex-wrap items-center gap-3'>
          <h2 className='font-bold text-foreground text-xl'>{t('yourBorrows')}</h2>
          <span className='rounded-md border border-border px-3 py-1 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
            {t('balance')} {formatUsd(totalBorrowUsd)}
          </span>
          <span className='rounded-md border border-border px-3 py-1 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
            {t('apy')} {borrowApy ?? '—'}
          </span>
          <span className='rounded-md border border-border px-3 py-1 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
            {t('borrowPowerUsed')} {borrowPowerUsed > 0 ? `${borrowPowerUsed.toFixed(2)}%` : '0%'}
          </span>
        </div>

        {borrowedReserves.length === 0 ? (
          <Empty className='rounded-xs border border-border bg-card'>
            <EmptyMedia variant='icon'>
              <HandCoins size={20} />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{t('noBorrowsTitle')}</EmptyTitle>
              <EmptyDescription>{t('noBorrowsDescription')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className='overflow-x-auto rounded-xs border border-border'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-border border-b bg-muted/30'>
                  <th className='px-4 py-3 text-left font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
                    {t('asset')}
                  </th>
                  <th className='px-4 py-3 text-left font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
                    {t('debt')}
                  </th>
                  <th className='px-4 py-3 text-left font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
                    {t('apy')}
                  </th>
                  <th className='px-4 py-3 text-right font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className='bg-card'>
                {borrowedReserves.map((ur) => {
                  const reserveLink = `/reserve-overview?underlyingAsset=${ur.reserve.underlyingAsset}`;
                  return (
                    <tr key={ur.reserve.underlyingAsset} className='border-border border-b last:border-b-0'>
                      <td className='px-4 py-3'>
                        <AssetCell
                          symbol={ur.reserve.symbol}
                          underlyingAsset={ur.reserve.underlyingAsset}
                          copyTitle={t('copyAddress')}
                          href={reserveLink}
                        />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex flex-col'>
                          <span className='font-medium text-foreground'>{formatUsd(ur.totalBorrowsUSD)}</span>
                          <span className='text-muted-foreground text-xs'>
                            {formatTokenAmount(ur.totalBorrows, 4)} {ur.reserve.symbol}
                          </span>
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <span className='font-medium text-amber-600'>{getBorrowApy(ur)}%</span>
                      </td>
                      <td className='px-4 py-3 text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button size='sm' variant='outline' asChild>
                            <Link href={`${reserveLink}&action=borrow`}>{t('borrow')}</Link>
                          </Button>
                          <Button size='sm' variant='ghost' asChild>
                            <Link href={`${reserveLink}&action=borrow`}>{t('repay')}</Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
