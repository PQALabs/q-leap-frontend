import { createQuery } from 'react-query-kit';
import { queryKeys } from '@/constants/query-keys';
import { getLiquidationPositionsRequest } from './requests';
import type { ILiquidationPositionsResponse } from './types';

export const useLiquidationPositions = createQuery<ILiquidationPositionsResponse, any, Error>({
  queryKey: queryKeys.liquidation.positions(),
  fetcher: getLiquidationPositionsRequest,
});
