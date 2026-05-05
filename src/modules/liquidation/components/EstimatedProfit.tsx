import { useMemo } from 'react';
import type { ILiquidationPosition } from '@/api/liquidation/types';
import { formatUsd } from '@/utils/format';

export function EstimatedProfit({ position }: { position: ILiquidationPosition }) {
  // Compute estimated profit from the best collateral bonus
  const bestBonus = useMemo(() => {
    if (!position.collaterals.length) return 0;
    return Math.max(...position.collaterals.map((c) => c.liquidationBonusPct));
  }, [position.collaterals]);

  const maxRepayUsd = Number(position.maxRepayUsd);
  const estimatedProfit = maxRepayUsd * (bestBonus / 100);

  if (estimatedProfit <= 0) return <span className='text-muted-foreground text-sm'>—</span>;

  return (
    <span className='font-semibold text-emerald-600 text-sm dark:text-emerald-400'>+{formatUsd(estimatedProfit)}</span>
  );
}
