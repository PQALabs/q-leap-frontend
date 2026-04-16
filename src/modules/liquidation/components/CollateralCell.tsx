import type { ICollateral } from '@/api/liquidation/types';
import { TokenLogo } from '@/components/token-logo';

export function CollateralCell({ collateral }: { collateral: ICollateral }) {
  return (
    <div className='flex flex-col gap-1'>
      <div className='flex items-center gap-1.5'>
        <TokenLogo symbol={collateral.symbol} size={18} />
        <span className='font-medium text-foreground text-sm'>{collateral.symbol}</span>
      </div>
      {collateral.liquidationBonusPct > 0 && (
        <span className='inline-flex w-fit items-center rounded-sm bg-emerald-100 px-1.5 py-0.5 font-semibold text-[10px] text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'>
          +{collateral.liquidationBonusPct}% Bonus
        </span>
      )}
    </div>
  );
}
