import { useMemo } from 'react';
import { STABLECOINS } from '@/config/market';
import { getDisplaySymbol } from '@/config/token-display';
import { useFormattedPoolData } from '@/hooks/use-formatted-pool-data';
import { valueToBigNumber } from '@/math-utils';
import { usePoolDataStore } from '@/stores/use-pool-data-store';
import { formatTokenAmount } from '@/utils/format';
import type { CoreAsset } from '../components/CoreAssets';

export function useMarketSummary() {
  const isLoading = usePoolDataStore.use.isLoading();
  const marketRefPriceInUsd = usePoolDataStore.use.marketRefPriceInUsd();
  const { reserves } = useFormattedPoolData();

  // ---------------------------------------------------------------------------
  // Derived summary values & Table Data (Single Pass)
  // ---------------------------------------------------------------------------
  const { sortedData, totalLockedInUsd, totalAvailableInUsd, totalBorrowedInUsd, utilizationRate } = useMemo(() => {
    let locked = valueToBigNumber('0');
    let available = valueToBigNumber('0');
    let borrowed = valueToBigNumber('0');
    let weightedApySum = valueToBigNumber('0');

    const mapped = [];

    for (const reserve of reserves) {
      if (!reserve.isActive || reserve.isFrozen) continue;

      const liquidityUsd = valueToBigNumber(reserve.totalLiquidity)
        .multipliedBy(reserve.priceInMarketReferenceCurrency)
        .multipliedBy(marketRefPriceInUsd);

      const availableUsd = valueToBigNumber(reserve.availableLiquidity)
        .multipliedBy(reserve.priceInMarketReferenceCurrency)
        .multipliedBy(marketRefPriceInUsd);

      const borrowedUsd = valueToBigNumber(reserve.totalDebt)
        .multipliedBy(reserve.priceInMarketReferenceCurrency)
        .multipliedBy(marketRefPriceInUsd);

      locked = locked.plus(liquidityUsd);
      available = available.plus(availableUsd);
      borrowed = borrowed.plus(borrowedUsd);
      weightedApySum = weightedApySum.plus(valueToBigNumber(reserve.supplyAPY).multipliedBy(liquidityUsd));

      const totalLiquidity = Number(reserve.totalLiquidity);
      const totalLiquidityInUSD = liquidityUsd.toNumber();

      const totalBorrows = Number(reserve.totalDebt);
      const totalBorrowsInUSD = borrowedUsd.toNumber();

      mapped.push({
        totalLiquidity,
        totalLiquidityInUSD,
        totalBorrows: reserve.borrowingEnabled ? totalBorrows : null,
        totalBorrowsInUSD: reserve.borrowingEnabled ? totalBorrowsInUSD : null,
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
      });
    }

    const calculatedWeightedApy = locked.gt(0) ? weightedApySum.dividedBy(locked) : valueToBigNumber(0);
    const calculatedUtilizationRate = locked.gt(0) ? borrowed.dividedBy(locked).multipliedBy(100).toNumber() : 0;

    return {
      sortedData: mapped,
      totalLockedInUsd: locked,
      totalAvailableInUsd: available,
      totalBorrowedInUsd: borrowed,
      weightedApy: calculatedWeightedApy,
      utilizationRate: calculatedUtilizationRate,
    };
  }, [reserves, marketRefPriceInUsd]);

  // Map sorted reserve data -> CoreAsset[] for the table
  const coreAssets: CoreAsset[] = useMemo(() => {
    return sortedData.map((item) => {
      const displaySymbol = getDisplaySymbol(item.currencySymbol);

      return {
        id: item.id,
        name: displaySymbol,
        symbol: displaySymbol,
        underlyingAsset: item.underlyingAsset,
        supplyApy: item.depositAPY >= 0 ? item.depositAPY * 100 : 0,
        totalSupplied: item.totalLiquidityInUSD,
        totalSuppliedNative: `${formatTokenAmount(item.totalLiquidity)} ${item.currencySymbol}`,
        borrowApy: item.variableBorrowRate >= 0 ? item.variableBorrowRate * 100 : 0,
        totalBorrowed: item.totalBorrowsInUSD !== null ? item.totalBorrowsInUSD : null,
        totalBorrowedNative:
          item.totalBorrows !== null ? `${formatTokenAmount(item.totalBorrows)} ${item.currencySymbol}` : '—',
        walletBalance: null,
        isStablecoin: STABLECOINS.has(item.currencySymbol.toUpperCase()),
      };
    });
  }, [sortedData]);

  return {
    isLoading,
    totalLockedInUsd: totalLockedInUsd.toNumber(),
    totalAvailableInUsd: totalAvailableInUsd.toNumber(),
    totalBorrowedInUsd: totalBorrowedInUsd.toNumber(),
    utilizationRate: Number(utilizationRate.toFixed(2)),
    utilizationRateLabel: `${utilizationRate.toFixed(2)}%`,
    coreAssets,
  };
}
