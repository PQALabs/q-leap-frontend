import { request } from '../client';

export const getLiquidationPositionsRequest = async () => {
  const { data } = await request({
    url: `/liquidation/positions`,
    method: 'GET',
  });

  return data;
};
