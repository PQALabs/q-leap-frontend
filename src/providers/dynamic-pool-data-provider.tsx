import { type PropsWithChildren, useEffect, useState } from 'react';
import { useCurrentTimestamp } from '@/hooks/use-current-timestamp';
import { formatReserve, formatUserSummary, normalize } from '@/math-utils';
import { type ComputedReserveData, type UserSummary, usePoolDataStore } from '@/stores/use-pool-data-store';

export function DynamicPoolDataProvider({ children }: PropsWithChildren<{}>) {
  const rawReserves = usePoolDataStore.use.rawReserves();
  const rawUserReserves = usePoolDataStore.use.rawUserReserves();
  const userId = usePoolDataStore.use.userId();
  const marketRefCurrencyDecimals = usePoolDataStore.use.marketRefCurrencyDecimals();
  const marketRefPriceInUsd = usePoolDataStore.use.marketRefPriceInUsd();
  const setDynamicData = usePoolDataStore.use.setDynamicData();

  const currentTimestamp = useCurrentTimestamp(1);
  const [lastAvgRatesUpdateTimestamp, setLastAvgRatesUpdateTimestamp] = useState(currentTimestamp);

  useEffect(() => {
    if (currentTimestamp > lastAvgRatesUpdateTimestamp + 1000 * 60 * 5) {
      setLastAvgRatesUpdateTimestamp(currentTimestamp);
    }
  }, [currentTimestamp, lastAvgRatesUpdateTimestamp]);

  useEffect(() => {
    const computedUserData =
      userId && rawUserReserves
        ? formatUserSummary({
            currentTimestamp,
            marketRefPriceInUsd,
            marketRefCurrencyDecimals,
            rawUserReserves: rawUserReserves,
          })
        : undefined;

    const formattedPoolReserves: ComputedReserveData[] = rawReserves.map((reserve) => {
      const formattedReserve = formatReserve({
        reserve,
        currentTimestamp,
      });
      const fullReserve: ComputedReserveData = {
        ...reserve,
        ...formattedReserve,
        priceInMarketReferenceCurrency: normalize(reserve.priceInMarketReferenceCurrency, marketRefCurrencyDecimals),
      };
      return fullReserve;
    });

    let userSummary: UserSummary | undefined = undefined;
    if (computedUserData && userId) {
      userSummary = {
        id: userId,
        ...computedUserData,
      };
    }

    setDynamicData({
      user: userSummary,
      reserves: formattedPoolReserves,
    });
  }, [
    currentTimestamp,
    marketRefPriceInUsd,
    marketRefCurrencyDecimals,
    rawUserReserves,
    rawReserves,
    userId,
    setDynamicData,
  ]);

  return <>{children}</>;
}
