'use client';

import { AlertTriangle, Info, Loader2, Lock, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { useConnection } from 'wagmi';
import { useReadErc20BalanceOf } from '@/abi/generated';
import { previewLiquidationRequest } from '@/api/liquidation/requests';
import type { ILiquidationPosition, IPreviewLiquidationResponse } from '@/api/liquidation/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLiquidation } from '@/hooks/use-liquidation';
import { formatUsd } from '@/utils/format';

interface LiquidationDialogProps {
  open: boolean;
  onClose: () => void;
  position: ILiquidationPosition;
}

export function LiquidationDialog({ open, onClose, position }: LiquidationDialogProps) {
  const [repayAmount, setRepayAmount] = useState<string>('');
  const [receiveAs, setReceiveAs] = useState<'underlying' | 'atoken'>('underlying');

  const { address: liquidatorAddress } = useConnection();

  const { data: rawBalance } = useReadErc20BalanceOf({
    address: position.debtAsset.address as `0x${string}`,
    args: liquidatorAddress ? [liquidatorAddress] : undefined,
    query: { enabled: !!liquidatorAddress, refetchInterval: 5000 },
  });

  const walletBalance = rawBalance ? formatUnits(rawBalance, position.debtAsset.decimals) : '0';

  const primaryCollateral = useMemo(() => {
    if (!position.collaterals?.length) return null;
    return position.collaterals.reduce((best, curr) =>
      Number(curr.balanceUsd) > Number(best.balanceUsd) ? curr : best
    );
  }, [position.collaterals]);

  const maxLiquidationUsd = Number(position.maxRepayUsd);
  const formattedMaxRepay = formatUnits(BigInt(position.maxRepayAmount || '0'), position.debtAsset.decimals);

  const handleMax50 = () => {
    setRepayAmount(formattedMaxRepay);
  };

  const [previewData, setPreviewData] = useState<IPreviewLiquidationResponse | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    if (!repayAmount || Number(repayAmount) <= 0 || !primaryCollateral) {
      setPreviewData(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsPreviewLoading(true);
      try {
        const rawAmount = parseUnits(repayAmount, position.debtAsset.decimals).toString();
        const res = await previewLiquidationRequest({
          userAddress: position.userAddress,
          debtAsset: position.debtAsset.address,
          collateralAsset: primaryCollateral.address,
          repayAmount: rawAmount,
        });

        if (res) {
          setPreviewData(res.data);
        }
      } catch (error) {
        console.error('Failed to preview liquidation:', error);
        setPreviewData(null);
      } finally {
        setIsPreviewLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [repayAmount, position, primaryCollateral]);

  // Fallback to local estimation if preview API fails or is loading first time
  const currentRepayNum = Number(repayAmount) || 0;
  const isInsufficientBalance = currentRepayNum > Number(walletBalance);
  const maxRepayAmountNum = Number(formattedMaxRepay) || 1;
  const debtPriceUsd = maxLiquidationUsd / maxRepayAmountNum;
  const formattedCollateralToken = formatUnits(
    BigInt(primaryCollateral?.balanceToken || '0'),
    primaryCollateral?.decimals || 18
  );
  const collateralBalanceToken = Number(formattedCollateralToken) || 1;
  const collateralBalanceUsd = Number(primaryCollateral?.balanceUsd) || 0;
  const collateralPriceUsd = collateralBalanceToken > 0 ? collateralBalanceUsd / collateralBalanceToken : 1;
  const bonusPct = primaryCollateral?.liquidationBonusPct || 0;
  const bonusMultiplier = 1 + bonusPct / 100;

  // Use preview data if available
  const collateralReceiveAmount = previewData?.collateralReceived
    ? Number(formatUnits(BigInt(previewData.collateralReceived), primaryCollateral?.decimals || 18))
    : collateralPriceUsd > 0
      ? (currentRepayNum * debtPriceUsd * bonusMultiplier) / collateralPriceUsd
      : 0;

  const currentRepayUsd = previewData?.debtRepaidUsd
    ? Number(previewData.debtRepaidUsd)
    : currentRepayNum * debtPriceUsd;
  const totalReceiveUsd = previewData?.collateralReceivedUsd
    ? Number(previewData.collateralReceivedUsd)
    : currentRepayUsd * bonusMultiplier;
  const estProfit = previewData?.profitUsd ? Number(previewData.profitUsd) : totalReceiveUsd - currentRepayUsd;

  const { status, needsApproval, allowance, approve, liquidate, isBusy, reset } = useLiquidation({
    collateralAssetAddress: primaryCollateral?.address as `0x${string}`,
    debtAssetAddress: position.debtAsset.address as `0x${string}`,
    debtDecimals: position.debtAsset.decimals,
    borrowerAddress: position.userAddress as `0x${string}`,
    liquidatorAddress,
    amountToCover: repayAmount,
    receiveAToken: receiveAs === 'atoken',
    isMax: repayAmount === formattedMaxRepay,
    onSuccess: () => {
      setRepayAmount('');
      reset();
      onClose();
    },
  });

  const handleAction = () => {
    if (needsApproval) {
      approve();
    } else {
      liquidate();
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      if (status !== 'idle' && !isBusy) reset();
      setRepayAmount('');
      onClose();
    }
  };

  // Prevent rendering if no collateral
  if (!primaryCollateral && open) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='gap-0 overflow-hidden border-border p-0 sm:max-w-md'>
        {/* Hidden title/description for screen readers */}
        <DialogTitle className='sr-only'>Liquidate Position</DialogTitle>
        <DialogDescription className='sr-only'>Liquidate a user's undercollateralized position</DialogDescription>

        <div className='flex items-center justify-between p-6 pb-4'>
          <h2 className='font-bold text-foreground text-xl'>Liquidate Position</h2>
        </div>

        <div className='space-y-5 px-6 pb-6'>
          {/* Borrower Info Box */}
          <div className='flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3'>
            <div className='flex flex-col'>
              <span className='font-semibold text-[10px] text-muted-foreground uppercase tracking-wider'>
                Borrower Address
              </span>
              <span className='mt-0.5 font-mono text-sm'>
                {position.userAddress.slice(0, 8)}...{position.userAddress.slice(-4)}
              </span>
            </div>
            <div className='flex flex-col items-end'>
              <span className='font-semibold text-[10px] text-muted-foreground uppercase tracking-wider'>
                Health Factor
              </span>
              <div className='mt-0.5 flex items-center gap-1 text-red-500'>
                <AlertTriangle className='h-3 w-3 fill-current' />
                <span className='font-bold text-sm'>{Number(position.healthFactor).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Debt to Repay Input */}
          <div className='space-y-1.5'>
            <div className='flex items-center justify-between text-xs'>
              <span className='font-semibold text-foreground'>Debt to Repay ({position.debtAsset.symbol})</span>
              <span className='text-muted-foreground'>Max Liquidation: {formatUsd(maxLiquidationUsd)}</span>
            </div>
            <div className='flex items-center rounded-lg border border-border bg-background px-3 py-2.5 transition-shadow focus-within:ring-1 focus-within:ring-ring'>
              <div className='flex flex-1 flex-col gap-0.5'>
                <input
                  type='text'
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder='0.00'
                  disabled={isBusy}
                  className='w-full border-none bg-transparent font-mono text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50'
                />
                <span className='min-h-[12px] text-[10px] text-muted-foreground/70'>
                  {repayAmount ? formatUsd(currentRepayUsd) : ''}
                </span>
              </div>
              <div className='flex shrink-0 items-center gap-2'>
                <button
                  onClick={handleMax50}
                  disabled={isBusy}
                  className='cursor-pointer rounded-sm bg-secondary px-2 py-1 font-bold text-[10px] text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  MAX 50%
                </button>
                <span className='font-semibold text-muted-foreground text-sm'>{position.debtAsset.symbol}</span>
              </div>
            </div>
            <div className='flex justify-between px-1 text-[10.5px] text-muted-foreground/80'>
              <span>
                Wallet: {Number(walletBalance).toLocaleString(undefined, { maximumFractionDigits: 4 })}{' '}
                {position.debtAsset.symbol}
              </span>
              <span>
                Allowance:{' '}
                {Number(allowance) > 1e15
                  ? '∞'
                  : Number(allowance).toLocaleString(undefined, { maximumFractionDigits: 4 })}{' '}
                {position.debtAsset.symbol}
              </span>
            </div>
            {isInsufficientBalance && (
              <div className='flex items-center gap-1.5 px-1 pt-0.5 font-medium text-[11px] text-destructive'>
                <AlertTriangle className='h-3 w-3' />
                <span>Insufficient {position.debtAsset.symbol} balance in your wallet</span>
              </div>
            )}
          </div>

          {/* Collateral to Receive */}
          <div className='rounded-lg border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='font-semibold text-emerald-800 text-xs dark:text-emerald-400'>
                Collateral to Receive
              </span>
              <span className='flex items-center gap-1 font-bold text-[10px] text-emerald-600 dark:text-emerald-500'>
                <TrendingUp className='h-3 w-3' />+{bonusPct}% Bonus
              </span>
            </div>
            <div className='flex items-end justify-between'>
              <div className='font-bold font-mono text-emerald-600 text-xl dark:text-emerald-400'>
                {isPreviewLoading ? (
                  <Loader2 className='h-5 w-5 animate-spin text-emerald-600 dark:text-emerald-400' />
                ) : (
                  <>
                    {collateralReceiveAmount > 0
                      ? collateralReceiveAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })
                      : '0.00'}{' '}
                    {primaryCollateral?.symbol}
                  </>
                )}
              </div>
              <div className='flex h-[20px] items-center text-emerald-600/80 text-sm dark:text-emerald-500/80'>
                {isPreviewLoading ? (
                  <span className='h-4 w-24 animate-pulse rounded bg-emerald-200/50'></span>
                ) : (
                  <>&approx; +{formatUsd(estProfit)} profit</>
                )}
              </div>
            </div>
          </div>

          {/* Receive As */}
          <div className='space-y-2'>
            <div className='flex items-center gap-1.5'>
              <span className='font-semibold text-[10px] text-muted-foreground uppercase tracking-wider'>
                Receive as
              </span>
              <Info className='h-3 w-3 text-muted-foreground' />
            </div>
            <Tabs
              value={receiveAs}
              onValueChange={(v) => !isBusy && setReceiveAs(v as 'underlying' | 'atoken')}
              className='w-full'
            >
              <TabsList className='h-10 w-full bg-muted/60 p-1'>
                <TabsTrigger value='underlying' disabled={isBusy} className='flex-1 text-xs'>
                  {primaryCollateral?.symbol || 'Underlying'}
                </TabsTrigger>
                <TabsTrigger value='atoken' disabled={isBusy} className='flex-1 text-xs'>
                  aToken
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Summary */}
          <div className='space-y-2.5 pt-2 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>You pay</span>
              {isPreviewLoading ? (
                <span className='h-4 w-16 animate-pulse rounded bg-muted' />
              ) : (
                <span className='font-medium font-mono text-foreground'>{formatUsd(currentRepayUsd)}</span>
              )}
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>You receive</span>
              {isPreviewLoading ? (
                <span className='h-4 w-16 animate-pulse rounded bg-muted' />
              ) : (
                <span className='font-medium font-mono text-foreground'>{formatUsd(totalReceiveUsd)}</span>
              )}
            </div>
            <div className='my-1 border-border border-t border-dashed' />
            <div className='flex items-center justify-between font-bold'>
              <span>Est. profit</span>
              {isPreviewLoading ? (
                <span className='h-4 w-16 animate-pulse rounded bg-emerald-200/50' />
              ) : (
                <span className='text-emerald-600 dark:text-emerald-400'>+{formatUsd(estProfit)}</span>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className='grid grid-cols-2 gap-3 pt-2'>
            <Button
              variant='ghost'
              onClick={handleOpenChange.bind(null, false)}
              disabled={isBusy}
              className='border border-transparent font-semibold text-destructive hover:bg-muted'
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={isBusy || currentRepayNum <= 0 || !liquidatorAddress || isInsufficientBalance}
              className='border-none bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:bg-emerald-600/50'
            >
              {isBusy ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {status === 'approving' || status === 'confirming-approve' ? 'Approving...' : 'Liquidating...'}
                </>
              ) : needsApproval ? (
                <>
                  <Lock className='mr-2 h-4 w-4' /> Approve
                </>
              ) : (
                'Confirm Liquidation ⚡'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
