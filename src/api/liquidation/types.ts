import type { TListResponse, TResponse } from '@/types';

export type IDashboardStatsResponse = TResponse<IDashboardStatsData>;

export interface IDashboardStatsData {
  totalProjects: number;
  activeProjects: number;
  totalProposals: number;
  upcomingProposals: number;
  liveProposals: number;
}

export interface IAssetInfo {
  symbol: string;
  address: string;
  decimals: number;
}

export interface ICollateral {
  symbol: string;
  address: string;
  decimals: number;
  balanceToken: string;
  balanceUsd: string;
  liquidationBonusPct: number;
  isActive: boolean;
}

export interface ILiquidationPosition {
  userAddress: string;
  healthFactor: string;
  debtAsset: IAssetInfo;
  totalDebtUsd: string;
  maxRepayUsd: string;
  maxRepayAmount: string;
  collaterals: ICollateral[];
}

export type ILiquidationPositionsResponse = TListResponse<ILiquidationPosition>;
