import type { TResponse } from '@/types';
import { request } from '../client';
import type { IPreviewLiquidationRequest, IPreviewLiquidationResponse } from './types';
export const getLiquidationPositionsRequest = async () => {
  const { data } = await request({
    url: `/liquidation/positions`,
    method: 'GET',
  });

  return data;
};

export const previewLiquidationRequest = async (payload: IPreviewLiquidationRequest) => {
  const { data } = await request<TResponse<IPreviewLiquidationResponse>>({
    url: `/liquidation/preview`,
    method: 'POST',
    data: payload,
  });

  return data;
};
