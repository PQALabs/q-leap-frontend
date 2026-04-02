import { type ReactElement, type ReactNode, useEffect } from 'react';
import { useConnection } from 'wagmi';
import type { ReserveDataHumanized } from '@/helpers/contract/ui-pool-data-provider';
import { usePoolData } from '@/hooks/use-pool-data';
import { normalize } from '@/math-utils';
import { useProtocolDataContext } from '@/providers/protocol-data-provider';
import { type UserReserveDataExtended, usePoolDataStore } from '@/stores/use-pool-data-store';
import { assetsOrder } from '@/ui-config/assets';

const API_ETH_MOCK_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
/**
 * Number of decimals used by the QDAY/USD Chainlink aggregator.
 * The on-chain aggregator at 0xfD26034797B16A26AE5bf78dA013b6ad81F5f324 uses 6 decimals,
 * meaning a raw value of 4299000000 = $4,299.00.
 * This is used to normalize `marketReferenceCurrencyPriceInUsd` from the UiPoolDataProviderV2.
 */
const QDAY_AGGREGATOR_DECIMALS = 6;
/**
 * removes the marketPrefix from a symbol
 * @param symbol
 * @param prefix
 */
export const unPrefixSymbol = (symbol: string, prefix: string) => {
  return symbol.toUpperCase().replace(RegExp(`^(${prefix[0]}?${prefix.slice(1)})`), '');
};

interface StaticPoolDataProviderProps {
  children: ReactNode;
  errorPage: ReactElement;
}

export function StaticPoolDataProvider({ children, errorPage }: StaticPoolDataProviderProps) {
  const { address: currentAccount } = useConnection();
  const { currentMarketData, chainId, networkConfig } = useProtocolDataContext();
  const RPC_ONLY_MODE = networkConfig.rpcOnly;
  const setStaticData = usePoolDataStore.use.setStaticData();
  const setIsLoading = usePoolDataStore.use.setIsLoading();

  const {
    error: rpcDataError,
    loading: rpcDataLoading,
    data: rpcData,
    refresh,
  } = usePoolData(
    networkConfig.addresses.uiPoolDataProvider as `0x${string}`,
    currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER as `0x${string}`,
    false,
    chainId,
    currentAccount as `0x${string}` | undefined
  );
  console.log('🚀 ~ StaticPoolDataProvider ~ rpcDataError:', rpcDataError);

  const activeData = rpcData;

  useEffect(() => {
    setIsLoading(rpcDataLoading);
  }, [rpcDataLoading, setIsLoading]);

  useEffect(() => {
    if (!activeData || rpcDataError) return;

    const reserves: ReserveDataHumanized[] | undefined = activeData.reserves?.reservesData.map((reserve) => ({
      ...reserve,
    }));

    const reservesWithFixedUnderlying: ReserveDataHumanized[] | undefined = reserves
      ?.map((reserve) => {
        if (reserve.symbol.toUpperCase() === `W${networkConfig.baseAsset}`) {
          return {
            ...reserve,
            symbol: networkConfig.baseAsset,
            underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
          };
        }
        return reserve;
      })
      .sort(
        ({ symbol: a }, { symbol: b }) => assetsOrder.indexOf(a.toUpperCase()) - assetsOrder.indexOf(b.toUpperCase())
      );

    const userReserves: UserReserveDataExtended[] = [];
    const userReservesWithFixedUnderlying: UserReserveDataExtended[] = [];
    activeData.userReserves?.forEach((userReserve) => {
      const reserve = reserves?.find(
        (reserve) => reserve.underlyingAsset.toLowerCase() === userReserve.underlyingAsset.toLowerCase()
      );
      if (reserve) {
        const reserveWithBase: UserReserveDataExtended = {
          ...userReserve,
          reserve,
        };
        userReserves.push(reserveWithBase);
        if (reserve.symbol.toUpperCase() === `W${networkConfig.baseAsset}`) {
          const userReserveFixed: UserReserveDataExtended = {
            ...userReserve,
            underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
            reserve: {
              ...reserve,
              symbol: networkConfig.baseAsset,
              underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
            },
          };
          userReservesWithFixedUnderlying.push(userReserveFixed);
        } else {
          userReservesWithFixedUnderlying.push(reserveWithBase);
        }
      }
    });

    const isUserHasDeposits = userReserves.some((userReserve) => userReserve.scaledATokenBalance !== '0');

    const marketRefPriceInUsd = activeData?.reserves?.baseCurrencyData?.marketReferenceCurrencyPriceInUsd
      ? activeData.reserves.baseCurrencyData?.marketReferenceCurrencyPriceInUsd
      : '0';

    const marketRefCurrencyDecimals = activeData?.reserves?.baseCurrencyData?.marketReferenceCurrencyDecimals
      ? activeData.reserves.baseCurrencyData?.marketReferenceCurrencyDecimals
      : 18;

    setStaticData({
      userId: currentAccount,
      chainId,
      networkConfig,
      refresh: refresh,
      WrappedBaseNetworkAssetAddress: networkConfig.baseAssetWrappedAddress
        ? networkConfig.baseAssetWrappedAddress
        : '', // TO-DO: Replace all instances of this with the value from protocol-data-provider instead
      rawReserves: reservesWithFixedUnderlying ? reservesWithFixedUnderlying : [],
      rawUserReserves: userReservesWithFixedUnderlying,
      rawReservesWithBase: reserves ? reserves : [],
      rawUserReservesWithBase: userReserves,
      marketRefPriceInUsd: normalize(marketRefPriceInUsd, QDAY_AGGREGATOR_DECIMALS),
      marketRefCurrencyDecimals,
      isUserHasDeposits,
    });
  }, [
    activeData,
    rpcDataError,
    currentAccount,
    chainId,
    networkConfig,
    refresh,
    RPC_ONLY_MODE,
    rpcData,
    setStaticData,
  ]);

  if (rpcDataError) {
    return errorPage;
  }

  return <>{children}</>;
}
