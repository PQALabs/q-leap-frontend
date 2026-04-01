import { useMemo } from 'react';
import { useCurrentTimestamp } from '@/hooks/use-current-timestamp';
import { formatReserve, formatUserSummary, normalize } from '@/math-utils';
import { type ComputedReserveData, type UserSummary, usePoolDataStore } from '@/stores/use-pool-data-store';

/**
 * Computes formatted pool reserves and user summary from raw on-chain data.
 *
 * Replaces the old `DynamicPoolDataProvider` wrapper — instead of computing
 * inside a useEffect and syncing to Zustand (which caused a double-render
 * every tick), this hook computes inline via useMemo so data is ready
 * in the same render cycle.
 *
 * Call this at page-level components and pass the result down via props.
 */
export function useFormattedPoolData() {
  const rawReserves = usePoolDataStore.use.rawReserves();
  const rawUserReserves = usePoolDataStore.use.rawUserReserves();
  const userId = usePoolDataStore.use.userId();
  const marketRefCurrencyDecimals = usePoolDataStore.use.marketRefCurrencyDecimals();
  const marketRefPriceInUsd = usePoolDataStore.use.marketRefPriceInUsd();
  const currentTimestamp = useCurrentTimestamp(1);

  const reserves = useMemo<ComputedReserveData[]>(
    () =>
      rawReserves.map((reserve) => ({
        ...reserve,
        ...formatReserve({ reserve, currentTimestamp }),
        priceInMarketReferenceCurrency: normalize(reserve.priceInMarketReferenceCurrency, marketRefCurrencyDecimals),
      })),
    [rawReserves, currentTimestamp, marketRefCurrencyDecimals]
  );

  const user = useMemo<UserSummary | undefined>(() => {
    if (!userId || !rawUserReserves) return undefined;
    return {
      id: userId,
      ...formatUserSummary({
        currentTimestamp,
        marketRefPriceInUsd,
        marketRefCurrencyDecimals,
        rawUserReserves,
      }),
    };
  }, [userId, rawUserReserves, currentTimestamp, marketRefPriceInUsd, marketRefCurrencyDecimals]);

  return { reserves, user };
}
