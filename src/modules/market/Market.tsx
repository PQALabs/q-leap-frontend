'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { UsdValue } from '@/components/usd-value';
import { valueToBigNumber } from '@/math-utils';
import { usePoolDataStore } from '@/stores/use-pool-data-store';
import { formatApy } from '@/utils/format';
import { type CoreAsset, CoreAssets } from './components/CoreAssets';
import { MarketBasicInfo } from './components/MarketBasicInfo';
import { CoreAssetsSkeleton, MarketBasicInfoSkeleton, MarketSummarySkeleton } from './components/MarketSkeletons';
import { MarketSummary } from './components/MarketSummary';

/** Format a native token amount: 1,234.56 DAI */
function formatTokenAmount(value: number, symbol: string): string {
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })} ${symbol}`;
}

/** Simple deterministic icon background based on symbol */
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
// Static fields
// ---------------------------------------------------------------------------
const MARKET_NAME = 'Qday';

/** Known stablecoin symbols — used for the "Stablecoins only" filter */
const STABLECOINS = new Set(['DAI', 'USDC', 'USDT']);

export function Market() {
  const t = useTranslations('modules.market.Market');
  const isLoading = usePoolDataStore.use.isLoading();
  const marketRefPriceInUsd = usePoolDataStore.use.marketRefPriceInUsd();
  const reserves = usePoolDataStore.use.reserves();
  const user = usePoolDataStore.use.user();

  // Accumulators for summary metrics
  let totalLockedInUsd = valueToBigNumber('0');
  let totalAvailableInUsd = valueToBigNumber('0');
  let totalBorrowedInUsd = valueToBigNumber('0');
  let weightedApySum = valueToBigNumber('0'); // supplyAPY * liquidityUSD

  const sortedData = reserves
    .filter((res) => res.isActive && !res.isFrozen)
    .map((reserve) => {
      const liquidityUsd = valueToBigNumber(reserve.totalLiquidity)
        .multipliedBy(reserve.priceInMarketReferenceCurrency)
        .multipliedBy(marketRefPriceInUsd);

      const availableUsd = valueToBigNumber(reserve.availableLiquidity)
        .multipliedBy(reserve.priceInMarketReferenceCurrency)
        .multipliedBy(marketRefPriceInUsd);

      const borrowedUsd = valueToBigNumber(reserve.totalDebt)
        .multipliedBy(reserve.priceInMarketReferenceCurrency)
        .multipliedBy(marketRefPriceInUsd);

      totalLockedInUsd = totalLockedInUsd.plus(liquidityUsd);
      totalAvailableInUsd = totalAvailableInUsd.plus(availableUsd);
      totalBorrowedInUsd = totalBorrowedInUsd.plus(borrowedUsd);
      weightedApySum = weightedApySum.plus(valueToBigNumber(reserve.supplyAPY).multipliedBy(liquidityUsd));

      const totalLiquidity = Number(reserve.totalLiquidity);
      const totalLiquidityInUSD = liquidityUsd.toNumber();

      const totalBorrows = Number(reserve.totalDebt);
      const totalBorrowsInUSD = borrowedUsd.toNumber();

      return {
        totalLiquidity,
        totalLiquidityInUSD,
        totalBorrows: reserve.borrowingEnabled ? totalBorrows : -1,
        totalBorrowsInUSD: reserve.borrowingEnabled ? totalBorrowsInUSD : -1,
        id: reserve.id,
        underlyingAsset: reserve.underlyingAsset,
        currencySymbol: reserve.symbol,
        depositAPY: reserve.borrowingEnabled ? Number(reserve.supplyAPY) : -1,
        avg30DaysLiquidityRate: Number(reserve.avg30DaysLiquidityRate),
        stableBorrowRate:
          reserve.stableBorrowRateEnabled && reserve.borrowingEnabled ? Number(reserve.stableBorrowAPY) : -1,
        variableBorrowRate: reserve.borrowingEnabled ? Number(reserve.variableBorrowAPY) : -1,
        avg30DaysVariableRate: Number(reserve.avg30DaysVariableBorrowRate),
        borrowingEnabled: reserve.borrowingEnabled,
        stableBorrowRateEnabled: reserve.stableBorrowRateEnabled,
        isFreezed: reserve.isFrozen,
      };
    });

  // Derived summary values
  const weightedApy = totalLockedInUsd.gt(0) ? weightedApySum.dividedBy(totalLockedInUsd) : valueToBigNumber(0);

  const utilizationRate = totalLockedInUsd.gt(0)
    ? totalBorrowedInUsd.dividedBy(totalLockedInUsd).multipliedBy(100).toNumber()
    : 0;

  // Map sorted reserve data → CoreAsset[] for the table
  const coreAssets: CoreAsset[] = sortedData.map((item) => ({
    id: item.id,
    name: item.currencySymbol,
    symbol: item.currencySymbol,
    subtitle: item.underlyingAsset.slice(0, 6) + '…' + item.underlyingAsset.slice(-4),
    underlyingAsset: item.underlyingAsset,
    iconBg: getIconBg(item.currencySymbol),
    iconColor: 'text-white',
    iconLabel: item.currencySymbol.charAt(0),
    supplyApy: item.depositAPY >= 0 ? item.depositAPY * 100 : 0,
    totalSupplied: <UsdValue value={item.totalLiquidityInUSD} />,
    totalSuppliedNative: formatTokenAmount(item.totalLiquidity, item.currencySymbol),
    borrowApy: item.variableBorrowRate >= 0 ? item.variableBorrowRate * 100 : 0,
    totalBorrowed: item.totalBorrowsInUSD >= 0 ? <UsdValue value={item.totalBorrowsInUSD} /> : '—',
    totalBorrowedNative: item.totalBorrows >= 0 ? formatTokenAmount(item.totalBorrows, item.currencySymbol) : '—',
    walletBalance: null,
    isStablecoin: STABLECOINS.has(item.currencySymbol.toUpperCase()),
  }));

  // ---------------------------------------------------------------------------
  // User net worth & net APY
  // ---------------------------------------------------------------------------
  const { netWorth, netApy } = useMemo(() => {
    if (!user) return { netWorth: 0, netApy: null as string | null };

    const totalSupplyUsd = valueToBigNumber(user.totalLiquidityUSD);
    const totalBorrowUsd = valueToBigNumber(user.totalBorrowsUSD);
    const worth = totalSupplyUsd.minus(totalBorrowUsd);

    // Build a reserve APY lookup from computed reserves
    const reserveApyMap = new Map<string, { supplyAPY: string; variableBorrowAPY: string }>();
    for (const r of reserves) {
      reserveApyMap.set(r.underlyingAsset, {
        supplyAPY: r.supplyAPY,
        variableBorrowAPY: r.variableBorrowAPY,
      });
    }

    // Weighted net APY: sum(supplyUSD * supplyAPY) - sum(borrowUSD * borrowAPY)
    let weightedSupplyApy = valueToBigNumber(0);
    let weightedBorrowApy = valueToBigNumber(0);

    for (const ur of user.userReservesData) {
      const apys = reserveApyMap.get(ur.reserve.underlyingAsset);
      if (!apys) continue;

      const supplyUsd = valueToBigNumber(ur.underlyingBalanceUSD);
      const borrowUsd = valueToBigNumber(ur.totalBorrowsUSD);

      weightedSupplyApy = weightedSupplyApy.plus(supplyUsd.multipliedBy(apys.supplyAPY));
      weightedBorrowApy = weightedBorrowApy.plus(borrowUsd.multipliedBy(apys.variableBorrowAPY));
    }

    let apyStr: string | null = null;
    if (totalSupplyUsd.gt(0) || totalBorrowUsd.gt(0)) {
      const netApyValue = totalSupplyUsd.gt(0)
        ? weightedSupplyApy.minus(weightedBorrowApy).dividedBy(totalSupplyUsd)
        : valueToBigNumber(0);
      apyStr = formatApy(netApyValue.toNumber() * 100);
    }

    return { netWorth: worth.toNumber(), netApy: apyStr };
  }, [user, reserves]);

  return (
    <main className='mx-auto flex w-full max-w-7xl flex-col gap-6 py-8'>
      {/* ① Basic info */}
      {isLoading ? (
        <MarketBasicInfoSkeleton />
      ) : (
        <MarketBasicInfo
          name={MARKET_NAME}
          description={t('marketDescription')}
          netWorth={netWorth}
          netApy={netApy}
          onViewTransactions={() => console.log('View transactions')}
        />
      )}

      {/* ② Summary */}
      {isLoading ? (
        <MarketSummarySkeleton />
      ) : (
        <MarketSummary
          totalMarketSize={totalLockedInUsd.toNumber()}
          totalAvailable={totalAvailableInUsd.toNumber()}
          currentApy={formatApy(weightedApy.toNumber() * 100)}
          utilizationRate={Number(utilizationRate.toFixed(2))}
          utilizationRateLabel={`${utilizationRate.toFixed(2)}%`}
        />
      )}

      {/* ③ Core assets */}
      {isLoading ? (
        <CoreAssetsSkeleton />
      ) : (
        <CoreAssets assets={coreAssets} onDetailsClick={(asset) => console.log('Details:', asset.id)} />
      )}
    </main>
  );
}
