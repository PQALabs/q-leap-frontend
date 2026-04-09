import { useMemo } from 'react';
import { getDisplayName } from '@/config/token-display';
import { useFormattedPoolData } from '@/hooks/use-formatted-pool-data';
import type { ComputedUserReserve } from '@/math-utils/formatters/user';
import { formatApy } from '@/utils/format';

export function useDashboardData() {
  const { user, reserves } = useFormattedPoolData();

  const derived = useMemo(() => {
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

    const supplied = user.userReservesData
      .filter((ur) => Number(ur.underlyingBalance) > 0)
      .map((ur) => ({ ...ur, reserve: { ...ur.reserve, name: getDisplayName(ur.reserve.symbol) } }));
    const borrowed = user.userReservesData
      .filter((ur) => Number(ur.totalBorrows) > 0)
      .map((ur) => ({ ...ur, reserve: { ...ur.reserve, name: getDisplayName(ur.reserve.symbol) } }));

    const totalSupply = Number(user.totalCollateralUSD);
    const totalBorrow = Number(user.totalBorrowsUSD);

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

  const getSupplyApy = (ur: ComputedUserReserve) => {
    const r = reserves.find((res) => res.underlyingAsset.toLowerCase() === ur.reserve.underlyingAsset.toLowerCase());
    return r ? (Number(r.supplyAPY) * 100).toFixed(2) : '0.00';
  };

  const getBorrowApy = (ur: ComputedUserReserve) => {
    const r = reserves.find((res) => res.underlyingAsset.toLowerCase() === ur.reserve.underlyingAsset.toLowerCase());
    return r ? (Number(r.variableBorrowAPY) * 100).toFixed(2) : '0.00';
  };

  return { ...derived, reserves, user, getSupplyApy, getBorrowApy };
}
