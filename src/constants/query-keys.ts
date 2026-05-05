export const queryKeys = {
  liquidation: {
    positions: (...params: any[]) => ['liquidation-positions', ...params],
    position: (...params: any[]) => ['liquidation-position', ...params],
  },
};
