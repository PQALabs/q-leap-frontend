import { useMemo, useState } from 'react';
import type { ILiquidationPosition } from '@/api/liquidation/types';
import { TokenLogo } from '@/components/token-logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatUsd } from '@/utils/format';
import { CollateralCell } from './CollateralCell';
import { CopyButton } from './CopyButton';
import { EstimatedProfit } from './EstimatedProfit';
import { HealthFactorBadge } from './HealthFactorBadge';
import { LiquidationDialog } from './LiquidationDialog';

export function LiquidationRow({ position, isLast }: { position: ILiquidationPosition; isLast: boolean }) {
  const [showDialog, setShowDialog] = useState(false);
  const shortAddress = `${position.userAddress.slice(0, 6)}...${position.userAddress.slice(-4)}`;

  // Pick the primary collateral (highest balance in USD)
  const primaryCollateral = useMemo(() => {
    if (!position.collaterals.length) return null;
    return position.collaterals.reduce((best, curr) =>
      Number(curr.balanceUsd) > Number(best.balanceUsd) ? curr : best
    );
  }, [position.collaterals]);

  const handleOpenDialog = () => {
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  return (
    <>
      <tr className={cn('group transition-colors hover:bg-accent/40', !isLast && 'border-border border-b')}>
        {/* User Address */}
        <td className='py-4 pr-4 pl-6'>
          <span className='flex items-center gap-1 font-mono text-foreground text-sm'>
            {shortAddress}
            <CopyButton text={position.userAddress} />
          </span>
        </td>

        {/* Health Factor */}
        <td className='px-4 py-4 text-center'>
          <div className='flex justify-center'>
            <HealthFactorBadge value={position.healthFactor} />
          </div>
        </td>

        {/* Debt Asset */}
        <td className='px-4 py-4 text-center'>
          <div className='flex items-center justify-center gap-1.5'>
            <TokenLogo symbol={position.debtAsset.symbol} size={20} />
            <span className='font-medium text-foreground text-sm'>{position.debtAsset.symbol}</span>
          </div>
        </td>

        {/* Debt Value */}
        <td className='px-4 py-4 text-right'>
          <span className='font-medium text-foreground text-sm tabular-nums'>{formatUsd(position.totalDebtUsd)}</span>
        </td>

        {/* Collateral Asset */}
        <td className='px-4 py-4'>
          {primaryCollateral ? (
            <CollateralCell collateral={primaryCollateral} />
          ) : (
            <span className='text-muted-foreground text-sm'>—</span>
          )}
        </td>

        {/* Est Profit */}
        <td className='px-4 py-4 text-right'>
          <EstimatedProfit position={position} />
        </td>

        {/* Action */}
        <td className='py-4 pr-6 pl-4 text-right'>
          <Button
            size='sm'
            onClick={handleOpenDialog}
            className='min-w-[90px] bg-foreground text-background hover:bg-foreground/80 dark:bg-foreground dark:text-background'
          >
            Liquidate
          </Button>
        </td>
      </tr>

      <LiquidationDialog open={showDialog} onClose={handleCloseDialog} position={position} />
    </>
  );
}
