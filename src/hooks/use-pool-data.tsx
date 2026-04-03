import {
  useReadUiPoolDataProviderV2GetReservesData,
  useReadUiPoolDataProviderV2GetUserReservesData,
} from '@/abi/generated';
import type {
  PoolBaseCurrencyHumanized,
  ReserveDataHumanized,
  ReservesDataHumanized,
  UserReserveDataHumanized,
} from '../helpers/contract/ui-pool-data-provider';

// interval in which the rpc data is refreshed
const POLLING_INTERVAL = 15 * 1000;

// ---------- Hook ----------

export interface PoolDataResponse {
  loading: boolean;
  error: boolean;
  data: {
    reserves: ReservesDataHumanized | undefined;
    userReserves: UserReserveDataHumanized[] | undefined;
  };
  refresh: () => Promise<void>;
}

export function usePoolData(
  poolDataProviderAddress: `0x${string}`,
  lendingPoolAddressProvider: `0x${string}`,
  skip: boolean,
  chainId: number,
  userAddress?: `0x${string}`
): PoolDataResponse {
  const {
    data: reservesDataRaw,
    isLoading: loadingReserves,
    isError: errorReserves,
    refetch: refetchReserves,
    error: errorReservesData,
  } = useReadUiPoolDataProviderV2GetReservesData({
    address: poolDataProviderAddress,
    args: [lendingPoolAddressProvider],
    chainId,
    query: {
      enabled: !skip,
      refetchInterval: POLLING_INTERVAL,
    },
  });

  const {
    data: userReservesDataRaw,
    isLoading: loadingUserReserves,
    isError: errorUserReserves,
    refetch: refetchUserReserves,
    error: errorUserReservesData,
  } = useReadUiPoolDataProviderV2GetUserReservesData({
    address: poolDataProviderAddress,
    args: userAddress ? [lendingPoolAddressProvider, userAddress] : undefined,
    chainId,
    query: {
      enabled: !skip && !!userAddress,
      refetchInterval: POLLING_INTERVAL,
    },
  });

  const loading = loadingReserves || loadingUserReserves;
  const error = errorReserves || errorUserReserves;

  // Transform raw blockchain data to humanized format
  let reserves: ReservesDataHumanized | undefined = undefined;
  if (reservesDataRaw) {
    const [rawReserves, rawBaseCurrency] = reservesDataRaw;

    const reservesData: ReserveDataHumanized[] = rawReserves.map((r) => ({
      id: `${lendingPoolAddressProvider}-${r.underlyingAsset}`.toLowerCase(),
      underlyingAsset: r.underlyingAsset.toLowerCase(),
      name: r.name,
      symbol: r.symbol,
      decimals: Number(r.decimals),
      baseLTVasCollateral: r.baseLTVasCollateral.toString(),
      reserveLiquidationThreshold: r.reserveLiquidationThreshold.toString(),
      reserveLiquidationBonus: r.reserveLiquidationBonus.toString(),
      reserveFactor: r.reserveFactor.toString(),
      usageAsCollateralEnabled: r.usageAsCollateralEnabled,
      borrowingEnabled: r.borrowingEnabled,
      stableBorrowRateEnabled: r.stableBorrowRateEnabled,
      isActive: r.isActive,
      isFrozen: r.isFrozen,
      liquidityIndex: r.liquidityIndex.toString(),
      variableBorrowIndex: r.variableBorrowIndex.toString(),
      liquidityRate: r.liquidityRate.toString(),
      variableBorrowRate: r.variableBorrowRate.toString(),
      stableBorrowRate: r.stableBorrowRate.toString(),
      lastUpdateTimestamp: Number(r.lastUpdateTimestamp),
      aTokenAddress: r.aTokenAddress.toLowerCase(),
      stableDebtTokenAddress: r.stableDebtTokenAddress.toLowerCase(),
      variableDebtTokenAddress: r.variableDebtTokenAddress.toLowerCase(),
      interestRateStrategyAddress: r.interestRateStrategyAddress.toLowerCase(),
      availableLiquidity: r.availableLiquidity.toString(),
      totalPrincipalStableDebt: r.totalPrincipalStableDebt.toString(),
      averageStableRate: r.averageStableRate.toString(),
      stableDebtLastUpdateTimestamp: Number(r.stableDebtLastUpdateTimestamp),
      totalScaledVariableDebt: r.totalScaledVariableDebt.toString(),
      priceInMarketReferenceCurrency: r.priceInMarketReferenceCurrency.toString(),
      variableRateSlope1: r.variableRateSlope1.toString(),
      variableRateSlope2: r.variableRateSlope2.toString(),
      stableRateSlope1: r.stableRateSlope1.toString(),
      stableRateSlope2: r.stableRateSlope2.toString(),
    }));

    const baseCurrencyData: PoolBaseCurrencyHumanized = {
      marketReferenceCurrencyDecimals: Number(0), // The contract returns unit, but typically decimals are fixed or calculated, assuming 0 for now as dummy or handle properly based on logic
      marketReferenceCurrencyPriceInUsd: rawBaseCurrency.marketReferenceCurrencyPriceInUsd.toString(),
      networkBaseTokenPriceInUsd: rawBaseCurrency.networkBaseTokenPriceInUsd.toString(),
      networkBaseTokenPriceDecimals: rawBaseCurrency.networkBaseTokenPriceDecimals,
    };

    // We get unit instead of decimals in V2. Let's calculate decimals based on unit.
    baseCurrencyData.marketReferenceCurrencyDecimals =
      rawBaseCurrency.marketReferenceCurrencyUnit.toString().length - 1;

    reserves = {
      reservesData,
      baseCurrencyData,
    };
  }

  let userReserves: UserReserveDataHumanized[] | undefined = undefined;
  if (userReservesDataRaw) {
    userReserves = (userReservesDataRaw as unknown as any[]).map((r) => ({
      underlyingAsset: r.underlyingAsset.toLowerCase(),
      scaledATokenBalance: r.scaledATokenBalance.toString(),
      usageAsCollateralEnabledOnUser: r.usageAsCollateralEnabledOnUser,
      stableBorrowRate: r.stableBorrowRate.toString(),
      scaledVariableDebt: r.scaledVariableDebt.toString(),
      principalStableDebt: r.principalStableDebt.toString(),
      stableBorrowLastUpdateTimestamp: Number(r.stableBorrowLastUpdateTimestamp),
    }));
  }

  return {
    loading,
    error,

    data: {
      reserves,
      userReserves,
    },
    refresh: async () => {
      await Promise.all([refetchReserves(), refetchUserReserves()]);
    },
  };
}
