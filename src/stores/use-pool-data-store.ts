import { createSelectorFunctions } from 'auto-zustand-selectors-hook';
import { create } from 'zustand';
import type { ReserveDataHumanized, UserReserveDataHumanized } from '@/helpers/contract/ui-pool-data-provider';
import type { FormatReserveResponse, FormatUserSummaryResponse } from '@/math-utils';
import type { ChainId, NetworkConfig } from '@/types/config/types';

export interface UserReserveDataExtended extends UserReserveDataHumanized {
  reserve: ReserveDataHumanized;
}

export interface ComputedReserveData extends FormatReserveResponse {
  id: string;
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: number;
  usageAsCollateralEnabled: boolean;
  borrowingEnabled: boolean;
  stableBorrowRateEnabled: boolean;
  isActive: boolean;
  isFrozen: boolean;
  aTokenAddress: string;
  stableDebtTokenAddress: string;
  variableDebtTokenAddress: string;
  priceInMarketReferenceCurrency: string;
  avg30DaysLiquidityRate?: string;
  avg30DaysVariableBorrowRate?: string;
}

export interface UserSummary extends FormatUserSummaryResponse {
  id: string;
}

export interface PoolDataState {
  isLoading: boolean;
  userId: string | undefined;
  chainId: ChainId | undefined;
  networkConfig: NetworkConfig | undefined;
  isUserHasDeposits: boolean;
  rawReserves: ReserveDataHumanized[];
  rawUserReserves: UserReserveDataExtended[] | undefined;
  rawReservesWithBase: ReserveDataHumanized[];
  rawUserReservesWithBase: UserReserveDataExtended[] | undefined;
  marketRefCurrencyDecimals: number;
  marketRefPriceInUsd: string;
  WrappedBaseNetworkAssetAddress: string;
  refresh: () => Promise<void>;
}

export interface PoolDataActions {
  setStaticData: (data: Omit<PoolDataState, 'isLoading' | 'setStaticData' | 'setIsLoading'>) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export type IPoolDataStore = PoolDataState & PoolDataActions;

const useBasePoolDataStore = create<IPoolDataStore>((set) => ({
  isLoading: true,
  isUserHasDeposits: false,
  userId: undefined,
  chainId: undefined,
  networkConfig: undefined,
  rawUserReserves: undefined,
  rawUserReservesWithBase: undefined,
  rawReserves: [],
  rawReservesWithBase: [],
  marketRefCurrencyDecimals: 18,
  marketRefPriceInUsd: '0',
  WrappedBaseNetworkAssetAddress: '',
  refresh: async () => {},

  setStaticData: (data) =>
    set({
      ...data,
    }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
}));

export const usePoolDataStore = createSelectorFunctions(useBasePoolDataStore);
