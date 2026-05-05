import type { TListResponse } from '@/types';

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

export interface IPreviewLiquidationRequest {
  userAddress: string;
  debtAsset: string;
  collateralAsset: string;
  repayAmount: string;
}

export interface IPreviewLiquidationResponse {
  collateralReceived: string;
  collateralReceivedUsd: string;
  debtRepaidUsd: string;
  bonusPct: number;
  profitUsd: string;
  isCollateralSufficient: boolean;
  actualRepayAmount: string;
}
