'use client';

import {
  ArrowDownToLine,
  ArrowUpToLine,
  ChevronDown,
  ChevronRight,
  Info,
  Loader2,
  Lock,
  TriangleAlert,
  Wallet,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatUnits } from 'viem';
import { useBalance, useConnection } from 'wagmi';
import { useReadErc20BalanceOf, useReadErc20Decimals } from '@/abi/generated';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EM_DASH } from '@/constants/common';
import { useBorrow } from '@/hooks/use-borrow';
import { useBorrowNative } from '@/hooks/use-borrow-native';
import { useRepay } from '@/hooks/use-repay';
import { useRepayNative } from '@/hooks/use-repay-native';
import { computeNewHealthFactor } from '@/lib/compute-health-factor';
import type { ComputedReserveData, UserSummary } from '@/stores/use-pool-data-store';
import { usePoolDataStore } from '@/stores/use-pool-data-store';
import { formatTokenAmount } from '@/utils/format';
import { AmountInput } from './AmountInput';
import { BorrowSuccessDialog } from './BorrowSuccessDialog';
import { RepaySuccessDialog } from './RepaySuccessDialog';
import { HealthFactorDisplay, InfoRow, TokenIcon } from './ReserveActionHelpers';

/** Whether this reserve supports native token borrow (WQDAY ↔ QDAY) */
const NATIVE_WRAP_MAP: Record<string, string> = {
  WQDAY: 'QDAY',
};

type BorrowMode = 'wrapped' | 'native';
type RepayMode = 'wrapped' | 'native';

interface BorrowRepayPanelProps {
  reserve: ComputedReserveData;
  user: UserSummary | undefined;
  marketRefPriceInUsd: string;
}

export function BorrowRepayPanel({ reserve, user, marketRefPriceInUsd }: BorrowRepayPanelProps) {
  const [borrowAmount, setBorrowAmount] = useState('');
  const [isMaxBorrowSelected, setIsMaxBorrowSelected] = useState(false);
  const [repayAmount, setRepayAmount] = useState('');
  const [isRepayMax, setIsRepayMax] = useState(false);
  const [openSection, setOpenSection] = useState<'borrow' | 'repay'>('borrow');
  const [borrowSuccessInfo, setBorrowSuccessInfo] = useState<{
    amount: string;
    symbol: string;
    txHash?: `0x${string}`;
  } | null>(null);
  const [repaySuccessInfo, setRepaySuccessInfo] = useState<{
    amount: string;
    symbol: string;
    txHash?: `0x${string}`;
  } | null>(null);

  const nativeSymbol = NATIVE_WRAP_MAP[reserve.symbol.toUpperCase()];
  const hasNativeOption = !!nativeSymbol;
  const [borrowMode, setBorrowMode] = useState<BorrowMode>('wrapped');
  const [repayMode, setRepayMode] = useState<RepayMode>('wrapped');
  const activeBorrowSymbol = borrowMode === 'native' && nativeSymbol ? nativeSymbol : reserve.symbol;
  const activeRepaySymbol = repayMode === 'native' && nativeSymbol ? nativeSymbol : reserve.symbol;
  const isRepayNative = repayMode === 'native';

  // ── Context ──
  const { address } = useConnection();
  const t = useTranslations('modules.market.ReserveActions');
  const refresh = usePoolDataStore.use.refresh();
  const networkConfig = usePoolDataStore.use.networkConfig();
  const explorerUrl = networkConfig?.explorerLink;

  const variableBorrowApy = (Number(reserve.variableBorrowAPY) * 100).toFixed(2);

  const userReserve = user?.userReservesData.find(
    (ur) => ur.reserve.underlyingAsset.toLowerCase() === reserve.underlyingAsset.toLowerCase()
  );
  const borrowedBalance = userReserve ? Number(userReserve.totalBorrows) : 0;

  // ── Wallet balance for repay ──
  const { data: erc20RawBalance, refetch: refetchBalance } = useReadErc20BalanceOf({
    address: reserve.underlyingAsset as `0x${string}`,
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });
  const { data: erc20Decimals } = useReadErc20Decimals({
    address: reserve.underlyingAsset as `0x${string}`,
    query: { enabled: !!address },
  });
  const erc20WalletBalance = useMemo(() => {
    if (erc20RawBalance == null || erc20Decimals == null) return '0';
    return formatUnits(erc20RawBalance, erc20Decimals);
  }, [erc20RawBalance, erc20Decimals]);

  const { data: nativeBalanceData } = useBalance({
    address,
    query: { enabled: !!address && hasNativeOption, refetchInterval: 5000 },
  });
  const nativeWalletBalance = nativeBalanceData
    ? formatUnits(nativeBalanceData.value, nativeBalanceData.decimals)
    : '0';

  const repayWalletBalance = isRepayNative ? nativeWalletBalance : erc20WalletBalance;
  const decimals = erc20Decimals ?? 18;

  // ── Borrow / Repay hooks ──
  const onTxSuccess = useCallback(() => {
    refetchBalance();
    refresh();
  }, [refetchBalance, refresh]);

  const erc20Borrow = useBorrow({
    tokenAddress: reserve.underlyingAsset as `0x${string}`,
    decimals: reserve.decimals,
    userAddress: address,
    amount: borrowAmount,
    onSuccess: onTxSuccess,
  });

  const nativeBorrow = useBorrowNative({
    variableDebtTokenAddress: reserve.variableDebtTokenAddress as `0x${string}`,
    userAddress: address,
    amount: borrowAmount,
    onSuccess: onTxSuccess,
  });

  const erc20Repay = useRepay({
    tokenAddress: reserve.underlyingAsset as `0x${string}`,
    decimals,
    userAddress: address,
    amount: repayAmount,
    isMax: isRepayMax,
    onSuccess: onTxSuccess,
  });

  const nativeRepay = useRepayNative({
    userAddress: address,
    amount: repayAmount,
    debtBalance: borrowedBalance.toString(),
    isMax: isRepayMax,
    onSuccess: onTxSuccess,
  });

  // Pick the active borrow hook based on mode
  const isBorrowNative = borrowMode === 'native';
  const isBorrowBusy = isBorrowNative ? nativeBorrow.isBusy : erc20Borrow.isBusy;
  const borrowStatus = isBorrowNative ? nativeBorrow.status : erc20Borrow.status;
  const borrowTxHash = isBorrowNative ? nativeBorrow.borrowTxHash : erc20Borrow.txHash;

  // Pick the active repay hook based on mode
  const isRepayBusy = isRepayNative ? nativeRepay.isBusy : erc20Repay.isBusy;
  const repayStatus = isRepayNative ? nativeRepay.status : erc20Repay.status;
  const repayTxHash = isRepayNative ? nativeRepay.txHash : erc20Repay.repayTxHash;

  // Show success dialog when borrow completes
  useEffect(() => {
    if (borrowStatus === 'success' && borrowAmount) {
      setBorrowSuccessInfo({
        amount: borrowAmount,
        symbol: activeBorrowSymbol,
        txHash: borrowTxHash as `0x${string}`,
      });
      setBorrowAmount('');
      setIsMaxBorrowSelected(false);
    }
  }, [borrowStatus, borrowAmount, activeBorrowSymbol, borrowTxHash]);

  // Show success dialog when repay completes
  useEffect(() => {
    if (repayStatus === 'success' && repayAmount) {
      setRepaySuccessInfo({
        amount: repayAmount,
        symbol: activeRepaySymbol,
        txHash: repayTxHash as `0x${string}`,
      });
      setRepayAmount('');
      setIsRepayMax(false);
    }
  }, [repayStatus, repayAmount, activeRepaySymbol, repayTxHash]);

  const handleBorrowDelegation = () => nativeBorrow.approveDelegation();
  const handleBorrow = () => (isBorrowNative ? nativeBorrow.borrow() : erc20Borrow.borrow());
  const handleRepayApprove = () => erc20Repay.approve();
  const handleRepay = () => (isRepayNative ? nativeRepay.repay() : erc20Repay.repay());

  // ── Max borrow calculation (per business-logic doc §2) ──
  const maxBorrowAmount = useMemo(() => {
    if (!user) return 0;

    // Step 1: max borrow based on collateral
    const availBorrowsMRC = Number(user.availableBorrowsMarketReferenceCurrency);
    const priceInMRC = Number(reserve.priceInMarketReferenceCurrency);
    const maxUserAmountToBorrow = availBorrowsMRC / priceInMRC;

    // Step 2: cap by pool liquidity
    const poolLiquidity = Number(reserve.availableLiquidity);
    let maxAmount = Math.max(Math.min(poolLiquidity, maxUserAmountToBorrow), 0);

    // Step 3: safety buffer if user already has borrows and limit is from collateral
    if (
      maxAmount > 0 &&
      Number(user.totalBorrowsMarketReferenceCurrency) > 0 &&
      maxUserAmountToBorrow < poolLiquidity * 1.01
    ) {
      maxAmount = maxAmount * 0.99;
    }

    return maxAmount;
  }, [user, reserve]);

  // ── Keep borrowAmount in sync when MAX is selected and price updates ──
  // Clamp to the latest maxBorrowAmount so it never exceeds the fresh value.
  useEffect(() => {
    if (isMaxBorrowSelected && maxBorrowAmount > 0) {
      setBorrowAmount((prev) => {
        const prevNum = Number(prev);
        // If current amount exceeds new max, clamp down; otherwise keep as-is
        return prevNum > maxBorrowAmount ? maxBorrowAmount.toString() : prev;
      });
    }
  }, [isMaxBorrowSelected, maxBorrowAmount]);

  // ── Projected HF after borrow ──
  const projectedBorrowHF = useMemo(() => {
    if (!user || !borrowAmount || Number(borrowAmount) <= 0) return null;
    return computeNewHealthFactor('borrow', borrowAmount, reserve, user, marketRefPriceInUsd);
  }, [user, borrowAmount, reserve, marketRefPriceInUsd]);

  // ── Blocking errors (per business-logic doc §5) ──
  const borrowBlockingError = useMemo(() => {
    if (!borrowAmount || Number(borrowAmount) <= 0) return null;
    const amt = Number(borrowAmount);

    // Check in order (later errors override earlier as per docs)
    let error: string | null = null;

    // 1. Borrowing not enabled
    if (!reserve.borrowingEnabled) {
      error = t('borrowingNotAvailable');
    }

    // 2. Insufficient collateral
    // Skip when MAX is selected — the amount was already computed safely.
    // This prevents false positives when pool data refreshes mid-interaction.
    if (user && !isMaxBorrowSelected && amt > maxBorrowAmount * 1.001) {
      error = t('insufficientCollateral');
    }

    // 3. Insufficient liquidity
    if (amt > Number(reserve.availableLiquidity)) {
      error = t('insufficientLiquidity', { symbol: reserve.symbol });
    }

    // 4. HF would drop below 1
    if (user && Number(user.totalBorrowsMarketReferenceCurrency) > 0 && projectedBorrowHF) {
      const hfNum = Number(projectedBorrowHF);
      if (!Number.isNaN(hfNum) && projectedBorrowHF !== '∞' && hfNum < 1) {
        error = t('hfBelowOne');
      }
    }

    return error;
  }, [borrowAmount, reserve, user, maxBorrowAmount, projectedBorrowHF]);

  // ── HF danger warning (HF < 1.5) ──
  const isBorrowHFDangerous = useMemo(() => {
    if (!user || Number(user.totalBorrowsMarketReferenceCurrency) === 0) {
      // First borrow — check projected HF
      if (!projectedBorrowHF || projectedBorrowHF === '∞') return false;
      return Number(projectedBorrowHF) < 1.5;
    }
    if (!projectedBorrowHF || projectedBorrowHF === '∞') return false;
    return Number(projectedBorrowHF) < 1.5;
  }, [user, projectedBorrowHF]);

  const canBorrow =
    !!address &&
    !!borrowAmount &&
    Number(borrowAmount) > 0 &&
    !borrowBlockingError &&
    reserve.borrowingEnabled &&
    reserve.isActive &&
    !reserve.isFrozen;

  return (
    <div className='flex flex-col gap-5'>
      {/* ── Borrow section ── */}
      <Collapsible
        open={openSection === 'borrow'}
        onOpenChange={(open) => setOpenSection(open ? 'borrow' : 'repay')}
        className='flex flex-col gap-3'
      >
        <CollapsibleTrigger asChild>
          <div className='flex cursor-pointer items-center justify-between'>
            {hasNativeOption && openSection === 'borrow' ? (
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type='button'
                      className='flex cursor-pointer items-center gap-2 font-semibold text-foreground transition-colors hover:text-primary'
                    >
                      {t('borrowSymbol', { symbol: activeBorrowSymbol })}
                      <ChevronDown size={14} className='text-muted-foreground' />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start'>
                    <DropdownMenuItem onClick={() => setBorrowMode('wrapped')}>
                      <TokenIcon symbol={reserve.symbol} size={16} />
                      {t('borrowSymbol', { symbol: reserve.symbol })}
                      <span className='ml-auto text-muted-foreground text-xs'>{t('erc20')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setBorrowMode('native')}>
                      <TokenIcon symbol={reserve.symbol} size={16} />
                      {t('borrowSymbol', { symbol: nativeSymbol })}
                      <span className='ml-auto text-muted-foreground text-xs'>{t('native')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <h3 className='flex items-center gap-2 font-semibold text-foreground'>
                {t('borrowSymbol', { symbol: hasNativeOption ? activeBorrowSymbol : reserve.symbol })}
              </h3>
            )}
            <ChevronRight
              size={16}
              className='ml-auto text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-90'
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className='flex flex-col gap-3'>
          <AmountInput
            value={borrowAmount}
            onChange={(v) => {
              setBorrowAmount(v);
              setIsMaxBorrowSelected(false);
            }}
            symbol={activeBorrowSymbol}
            onMax={() => {
              setBorrowAmount(maxBorrowAmount.toString());
              setIsMaxBorrowSelected(true);
            }}
            label={t('amount')}
            usdValue={
              borrowAmount && Number(borrowAmount) > 0
                ? Number(borrowAmount) * Number(reserve.priceInMarketReferenceCurrency) * Number(marketRefPriceInUsd)
                : undefined
            }
            validate={(v) => {
              if (!v || Number(v) <= 0) return null;
              if (!isMaxBorrowSelected && Number(v) > maxBorrowAmount) return t('exceedsMaxBorrow');
              return null;
            }}
          />
          <div className='ml-auto flex flex-col items-end'>
            <span className='flex items-center gap-1 text-muted-foreground text-xs'>
              {t('availableToBorrow')}: {formatTokenAmount(maxBorrowAmount)} {activeBorrowSymbol}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={12} className='cursor-help text-muted-foreground' />
                </TooltipTrigger>
                <TooltipContent side='top' className='max-w-[240px]'>
                  {t('availableToBorrowTooltip')}
                </TooltipContent>
              </Tooltip>
            </span>
            <span className='text-[11px] text-muted-foreground/60'>
              ${' '}
              {(maxBorrowAmount * Number(reserve.priceInMarketReferenceCurrency) * Number(marketRefPriceInUsd)).toFixed(
                2
              )}
            </span>
          </div>

          {(!reserve.isActive || reserve.isFrozen || !reserve.borrowingEnabled) && (
            <Alert variant='destructive'>
              <TriangleAlert className='size-4' />
              <AlertDescription className='text-xs'>
                {!reserve.isActive
                  ? t('reserveNotActive')
                  : reserve.isFrozen
                    ? t('reserveFrozenBorrow')
                    : t('borrowingNotAvailable')}
              </AlertDescription>
            </Alert>
          )}

          {borrowBlockingError && (
            <Alert variant='destructive'>
              <TriangleAlert className='size-4' />
              <AlertDescription className='text-xs'>{borrowBlockingError}</AlertDescription>
            </Alert>
          )}

          {isBorrowHFDangerous && !borrowBlockingError && (
            <Alert variant='warning'>
              <TriangleAlert className='size-4' />
              <AlertDescription className='text-xs'>
                {t('hfDangerWarning')}
                {projectedBorrowHF ? ` (${projectedBorrowHF})` : ''}.
              </AlertDescription>
            </Alert>
          )}

          <div className='flex gap-3'>
            {isBorrowNative && (
              <Button
                variant='outline'
                className='flex-1'
                icon={
                  nativeBorrow.status === 'approving-delegation' || nativeBorrow.status === 'confirming-delegation' ? (
                    <Loader2 size={14} className='animate-spin' />
                  ) : (
                    <Lock size={14} />
                  )
                }
                onClick={handleBorrowDelegation}
                disabled={!canBorrow || isBorrowBusy || !nativeBorrow.needsDelegation}
              >
                {nativeBorrow.status === 'approving-delegation'
                  ? t('signing')
                  : nativeBorrow.status === 'confirming-delegation'
                    ? t('confirming')
                    : nativeBorrow.needsDelegation
                      ? t('approveDelegation')
                      : t('delegationApprovedBtn')}
              </Button>
            )}
            <Button
              className='flex-1'
              icon={
                borrowStatus === 'borrowing' || borrowStatus === 'confirming' ? (
                  <Loader2 size={14} className='animate-spin' />
                ) : (
                  <ArrowDownToLine size={14} />
                )
              }
              onClick={handleBorrow}
              disabled={!canBorrow || isBorrowBusy || (isBorrowNative && nativeBorrow.needsDelegation)}
            >
              {borrowStatus === 'borrowing'
                ? t('signing')
                : borrowStatus === 'confirming'
                  ? t('confirming')
                  : t('borrow')}
            </Button>
          </div>

          {borrowStatus === 'success' && !borrowSuccessInfo && (
            <p className='font-medium text-emerald-600 text-xs'>{t('borrowConfirmed')}</p>
          )}

          {/* ── Borrow Success Dialog ── */}
          <BorrowSuccessDialog
            open={!!borrowSuccessInfo}
            onClose={() => {
              setBorrowSuccessInfo(null);
              erc20Borrow.reset();
              nativeBorrow.reset();
            }}
            amount={borrowSuccessInfo?.amount ?? '0'}
            symbol={borrowSuccessInfo?.symbol ?? reserve.symbol}
            txHash={borrowSuccessInfo?.txHash}
            explorerUrl={explorerUrl}
          />

          <div className='flex flex-col gap-2 rounded-xs border border-border p-3'>
            {isBorrowNative && (
              <InfoRow
                label={t('debtDelegation')}
                value={
                  Number(nativeBorrow.delegationAllowance) > 1e15
                    ? t('delegationApproved')
                    : `${formatTokenAmount(nativeBorrow.delegationAllowance)} ${reserve.symbol}`
                }
              />
            )}
            <InfoRow label={t('borrowApyVariable')} value={`${variableBorrowApy}%`} valueColor='text-red-500' />
            <InfoRow
              label={t('healthFactor')}
              value={
                user ? (
                  <div className='flex flex-col items-end gap-0.5'>
                    <HealthFactorDisplay
                      currentHf={Number(user.healthFactor).toFixed(2)}
                      newHf={
                        borrowAmount && Number(borrowAmount) > 0
                          ? computeNewHealthFactor('borrow', borrowAmount, reserve, user, marketRefPriceInUsd)
                          : EM_DASH
                      }
                    />
                    <span className='text-[11px] text-muted-foreground'>{t('liquidationAtOne')}</span>
                  </div>
                ) : (
                  '—'
                )
              }
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* ── Repay section ── */}
      <Collapsible
        open={openSection === 'repay'}
        onOpenChange={(open) => setOpenSection(open ? 'repay' : 'borrow')}
        className='flex flex-col gap-3'
      >
        <CollapsibleTrigger asChild>
          <div className='flex cursor-pointer items-center justify-between'>
            {hasNativeOption && openSection === 'repay' ? (
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type='button'
                      className='flex cursor-pointer items-center gap-2 font-semibold text-foreground transition-colors hover:text-primary'
                    >
                      {t('repaySymbol', { symbol: activeRepaySymbol })}
                      <ChevronDown size={14} className='text-muted-foreground' />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start'>
                    <DropdownMenuItem onClick={() => setRepayMode('wrapped')}>
                      <TokenIcon symbol={reserve.symbol} />
                      {reserve.symbol}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRepayMode('native')}>
                      <TokenIcon symbol={nativeSymbol!} />
                      {nativeSymbol}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <h3 className='flex items-center gap-2 font-semibold text-foreground'>
                {t('repaySymbol', { symbol: hasNativeOption ? activeRepaySymbol : reserve.symbol })}
              </h3>
            )}
            <ChevronRight
              size={16}
              className='ml-auto text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-90'
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className='flex flex-col gap-3'>
          <AmountInput
            value={repayAmount}
            onChange={(v) => {
              setRepayAmount(v);
              setIsRepayMax(false);
            }}
            symbol={activeRepaySymbol}
            onMax={() => {
              // Max repay = min(wallet balance, debt)
              const maxRepay = Math.min(Number(repayWalletBalance), borrowedBalance);
              // For native, leave a small gas buffer
              const buffered = isRepayNative ? Math.max(maxRepay - 0.004, 0) : maxRepay;
              setRepayAmount(buffered.toString());
              setIsRepayMax(buffered >= borrowedBalance);
            }}
            label={t('repayAmount')}
            usdValue={
              repayAmount && Number(repayAmount) > 0
                ? Number(repayAmount) * Number(reserve.priceInMarketReferenceCurrency) * Number(marketRefPriceInUsd)
                : undefined
            }
            validate={(v) => {
              if (!v || Number(v) <= 0) return null;
              if (Number(v) > Number(repayWalletBalance)) return t('insufficientWalletBalance');
              if (Number(v) > borrowedBalance) return t('exceedsRemainingDebt');
              return null;
            }}
          />
          <div className='ml-auto flex flex-col items-end'>
            <span className='flex items-center gap-1 text-muted-foreground text-xs'>
              <Wallet size={14} className='inline' /> {t('balance')}: {formatTokenAmount(repayWalletBalance)}{' '}
              {activeRepaySymbol}
            </span>
          </div>

          {borrowedBalance <= 0 && (
            <Alert>
              <TriangleAlert className='size-4' />
              <AlertDescription className='text-xs'>{t('noOutstandingDebt')}</AlertDescription>
            </Alert>
          )}

          <div className='flex gap-3'>
            {/* Approve button — only for ERC20 repay */}
            {!isRepayNative && (
              <Button
                variant='outline'
                className='flex-1'
                icon={
                  erc20Repay.status === 'approving' || erc20Repay.status === 'confirming-approve' ? (
                    <Loader2 size={14} className='animate-spin' />
                  ) : (
                    <Lock size={14} />
                  )
                }
                disabled={!erc20Repay.needsApproval || erc20Repay.isBusy || borrowedBalance <= 0}
                onClick={handleRepayApprove}
              >
                {erc20Repay.needsApproval ? t('approve') : t('approved')}
              </Button>
            )}
            <Button
              className='flex-1'
              icon={isRepayBusy ? <Loader2 size={14} className='animate-spin' /> : <ArrowUpToLine size={14} />}
              disabled={
                isRepayBusy ||
                !repayAmount ||
                Number(repayAmount) <= 0 ||
                borrowedBalance <= 0 ||
                Number(repayAmount) > Number(repayWalletBalance) ||
                (!isRepayNative && erc20Repay.needsApproval)
              }
              onClick={handleRepay}
            >
              {isRepayBusy ? t('repaying') : t('repay')}
            </Button>
          </div>

          {/* ── Repay Success Dialog ── */}
          <RepaySuccessDialog
            open={!!repaySuccessInfo}
            onClose={() => {
              setRepaySuccessInfo(null);
              erc20Repay.reset();
              nativeRepay.reset();
            }}
            amount={repaySuccessInfo?.amount ?? '0'}
            symbol={repaySuccessInfo?.symbol ?? reserve.symbol}
            txHash={repaySuccessInfo?.txHash}
            explorerUrl={explorerUrl}
          />

          <div className='flex flex-col gap-2 rounded-xs border border-border p-3'>
            <InfoRow
              className='items-baseline'
              label={t('remainingDebt')}
              value={
                <div className='flex flex-col items-end gap-0.5'>
                  <span className='font-medium text-foreground text-sm'>
                    {formatTokenAmount(borrowedBalance)} {reserve.symbol}
                    {repayAmount && Number(repayAmount) > 0 && (
                      <>
                        {' '}
                        <span className='text-muted-foreground'>→</span>{' '}
                        {formatTokenAmount(Math.max(borrowedBalance - Number(repayAmount), 0))} {reserve.symbol}
                      </>
                    )}
                  </span>
                  <span className='text-[11px] text-muted-foreground'>
                    $
                    {(
                      borrowedBalance *
                      Number(reserve.priceInMarketReferenceCurrency) *
                      Number(marketRefPriceInUsd)
                    ).toFixed(2)}
                    {repayAmount && Number(repayAmount) > 0 && (
                      <>
                        {' → $'}
                        {(
                          Math.max(borrowedBalance - Number(repayAmount), 0) *
                          Number(reserve.priceInMarketReferenceCurrency) *
                          Number(marketRefPriceInUsd)
                        ).toFixed(2)}
                      </>
                    )}
                  </span>
                </div>
              }
            />
            <InfoRow label={t('borrowApyVariable')} value={`${variableBorrowApy}%`} />
            <InfoRow
              label={t('healthFactor')}
              value={
                user ? (
                  <div className='flex flex-col items-end gap-0.5'>
                    <HealthFactorDisplay
                      currentHf={Number(user.healthFactor).toFixed(2)}
                      newHf={
                        repayAmount && Number(repayAmount) > 0
                          ? computeNewHealthFactor('repay', repayAmount, reserve, user, marketRefPriceInUsd)
                          : EM_DASH
                      }
                    />
                    <span className='text-[11px] text-muted-foreground'>{t('liquidationAtOne')}</span>
                  </div>
                ) : (
                  EM_DASH
                )
              }
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
