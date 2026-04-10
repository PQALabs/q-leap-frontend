'use client';

import {
  ArrowDownToLine,
  ArrowUpToLine,
  ChevronDown,
  ChevronRight,
  Info,
  Landmark,
  Loader2,
  Lock,
  TriangleAlert,
  Wallet,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
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
import { useSupply } from '@/hooks/use-supply';
import { useSupplyNative } from '@/hooks/use-supply-native';
import { useWithdraw } from '@/hooks/use-withdraw';
import { useWithdrawNative } from '@/hooks/use-withdraw-native';
import { computeNewHealthFactor } from '@/lib/compute-health-factor';
import { truncateInputAmount } from '@/math-utils';
import type { ComputedReserveData, UserSummary } from '@/stores/use-pool-data-store';
import { usePoolDataStore } from '@/stores/use-pool-data-store';
import { formatTokenAmount } from '@/utils/format';
import { AmountInput } from './AmountInput';
import { HealthFactorDisplay, InfoRow, TokenIcon } from './ReserveActionHelpers';
import { SupplySuccessDialog } from './SupplySuccessDialog';
import { WithdrawSuccessDialog } from './WithdrawSuccessDialog';

/** Whether this reserve supports native token supply (WQDAY ↔ QDAY) */
const NATIVE_WRAP_MAP: Record<string, string> = {
  WQDAY: 'QDAY',
};

type SupplyMode = 'wrapped' | 'native';
type WithdrawMode = 'wrapped' | 'native';

interface SupplyWithdrawPanelProps {
  reserve: ComputedReserveData;
  user: UserSummary | undefined;
  marketRefPriceInUsd: string;
}

export function SupplyWithdrawPanel({ reserve, user, marketRefPriceInUsd }: SupplyWithdrawPanelProps) {
  const [supplyAmount, setSupplyAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isMaxWithdraw, setIsMaxWithdraw] = useState(false);
  const [isMaxWithdrawSelected, setIsMaxWithdrawSelected] = useState(false);
  const searchParams = useSearchParams();
  const actionParam = searchParams.get('action');
  const [openSection, setOpenSection] = useState<'supply' | 'withdraw'>(
    actionParam === 'withdraw' ? 'withdraw' : 'supply'
  );
  const [successInfo, setSuccessInfo] = useState<{
    amount: string;
    symbol: string;
    txHash?: `0x${string}`;
    type?: 'supply' | 'withdraw';
  } | null>(null);

  const nativeSymbol = NATIVE_WRAP_MAP[reserve.symbol.toUpperCase()];
  const hasNativeOption = !!nativeSymbol;
  const [supplyMode, setSupplyMode] = useState<SupplyMode>('wrapped');
  const [withdrawMode, setWithdrawMode] = useState<WithdrawMode>('wrapped');
  const activeSupplySymbol = supplyMode === 'native' && nativeSymbol ? nativeSymbol : reserve.symbol;
  const activeWithdrawSymbol = withdrawMode === 'native' && nativeSymbol ? nativeSymbol : reserve.symbol;

  // ── Context ──
  const { address } = useConnection();
  const t = useTranslations('modules.market.ReserveActions');
  const tt = useTranslations('modules.market.Toasts');
  const refresh = usePoolDataStore.use.refresh();
  const networkConfig = usePoolDataStore.use.networkConfig();
  const explorerUrl = networkConfig?.explorerLink;

  // ── ERC-20 balance ──
  const { data: erc20RawBalance, refetch: refetchBalance } = useReadErc20BalanceOf({
    address: reserve.underlyingAsset as `0x${string}`,
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });
  const { data: erc20Decimals } = useReadErc20Decimals({
    address: reserve.underlyingAsset as `0x${string}`,
    query: { enabled: !!address },
  });

  const erc20Balance = useMemo(() => {
    if (erc20RawBalance == null || erc20Decimals == null) return '0';
    return formatUnits(erc20RawBalance, erc20Decimals);
  }, [erc20RawBalance, erc20Decimals]);

  // ── Native balance (for QDAY) ──
  const { data: nativeBalanceData } = useBalance({
    address,
    query: { enabled: !!address && hasNativeOption, refetchInterval: 5000 },
  });
  const nativeBalance = nativeBalanceData ? formatUnits(nativeBalanceData.value, nativeBalanceData.decimals) : '0';

  const decimals = erc20Decimals ?? 18;

  // ── Supply hooks ──
  const onTxSuccess = useCallback(() => {
    refetchBalance();
    refresh();
  }, [refetchBalance, refresh]);

  const erc20Supply = useSupply({
    tokenAddress: reserve.underlyingAsset as `0x${string}`,
    decimals,
    userAddress: address,
    amount: supplyAmount,
    onSuccess: onTxSuccess,
    toastLabels: {
      approvalConfirmed: tt('approvalConfirmed'),
      approvalConfirmedDesc: tt('approvalConfirmedDesc'),
      approvalFailed: tt('approvalFailed'),
      approvalReverted: tt('approvalReverted'),
      waitingApprovalSignature: tt('waitingApprovalSignature'),
      confirmingApproval: tt('confirmingApproval'),
      supplyConfirmed: tt('supplyConfirmed'),
      supplyConfirmedDesc: tt('supplyConfirmedDesc', { amount: supplyAmount, symbol: activeSupplySymbol }),
      supplyFailed: tt('supplyFailed'),
      supplyReverted: tt('supplyReverted'),
      waitingSupplySignature: tt('waitingSupplySignature'),
      confirmingSupply: tt('confirmingSupply'),
      txFailed: tt('txFailed'),
    },
  });

  const nativeSupply = useSupplyNative({
    userAddress: address,
    amount: supplyAmount,
    onSuccess: onTxSuccess,
    toastLabels: {
      supplyConfirmed: tt('supplyConfirmed'),
      supplyConfirmedDesc: tt('supplyConfirmedDesc', { amount: supplyAmount, symbol: activeSupplySymbol }),
      supplyFailed: tt('supplyFailed'),
      supplyReverted: tt('supplyReverted'),
      waitingSupplySignature: tt('waitingSupplySignature'),
      confirmingSupply: tt('confirmingSupply'),
      txFailed: tt('txFailed'),
    },
  });

  // Pick the active supply hook based on mode
  const isSupplyNative = supplyMode === 'native';
  const isSupplyBusy = isSupplyNative ? nativeSupply.isBusy : erc20Supply.isBusy;
  const supplyStatus = isSupplyNative ? nativeSupply.status : erc20Supply.status;
  const supplyTxHash = isSupplyNative ? nativeSupply.txHash : erc20Supply.depositTxHash;

  // ── Withdraw hooks ──
  const erc20Withdraw = useWithdraw({
    tokenAddress: reserve.underlyingAsset as `0x${string}`,
    decimals,
    userAddress: address,
    amount: withdrawAmount,
    isMax: isMaxWithdraw,
    onSuccess: onTxSuccess,
    toastLabels: {
      withdrawConfirmed: tt('withdrawConfirmed'),
      withdrawConfirmedDesc: tt('withdrawConfirmedDesc', { amount: withdrawAmount, symbol: activeWithdrawSymbol }),
      withdrawFailed: tt('withdrawFailed'),
      withdrawReverted: tt('withdrawReverted'),
      waitingWithdrawSignature: tt('waitingWithdrawSignature'),
      confirmingWithdraw: tt('confirmingWithdraw'),
      txFailed: tt('txFailed'),
    },
  });

  const nativeWithdraw = useWithdrawNative({
    aTokenAddress: reserve.aTokenAddress as `0x${string}`,
    userAddress: address,
    amount: withdrawAmount,
    isMax: isMaxWithdraw,
    onSuccess: onTxSuccess,
    toastLabels: {
      approvalConfirmed: tt('approvalConfirmed'),
      approvalConfirmedDesc: tt('approvalConfirmedDesc'),
      approvalFailed: tt('approvalFailed'),
      waitingApprovalSignature: tt('waitingApprovalSignature'),
      confirmingApproval: tt('confirmingApproval'),
      withdrawConfirmed: tt('withdrawConfirmed'),
      withdrawConfirmedDesc: tt('withdrawConfirmedDesc', { amount: withdrawAmount, symbol: activeWithdrawSymbol }),
      withdrawFailed: tt('withdrawFailed'),
      withdrawReverted: tt('withdrawReverted'),
      waitingWithdrawSignature: tt('waitingWithdrawSignature'),
      confirmingWithdraw: tt('confirmingWithdraw'),
      txFailed: tt('txFailed'),
    },
  });

  // Pick the active withdraw hook based on mode
  const isWithdrawNative = withdrawMode === 'native';
  const isWithdrawBusy = isWithdrawNative ? nativeWithdraw.isBusy : erc20Withdraw.isBusy;
  const withdrawStatus = isWithdrawNative ? nativeWithdraw.status : erc20Withdraw.status;
  const withdrawTxHash = isWithdrawNative ? nativeWithdraw.withdrawTxHash : erc20Withdraw.txHash;

  // Show success dialog when supply completes
  useEffect(() => {
    if (supplyStatus === 'success' && supplyAmount) {
      setSuccessInfo({
        amount: supplyAmount,
        symbol: activeSupplySymbol,
        txHash: supplyTxHash as `0x${string}`,
        type: 'supply',
      });
      setSupplyAmount('');
    }
  }, [supplyStatus, supplyAmount, activeSupplySymbol, supplyTxHash]);

  // Show success dialog when withdraw completes
  useEffect(() => {
    if (withdrawStatus === 'success' && withdrawAmount) {
      setSuccessInfo({
        amount: withdrawAmount,
        symbol: activeWithdrawSymbol,
        txHash: withdrawTxHash as `0x${string}`,
        type: 'withdraw',
      });
      setWithdrawAmount('');
      setIsMaxWithdraw(false);
      setIsMaxWithdrawSelected(false);
    }
  }, [withdrawStatus, withdrawAmount, activeWithdrawSymbol, withdrawTxHash]);

  const handleApprove = () => erc20Supply.approve();
  const handleSupply = () => (isSupplyNative ? nativeSupply.supply() : erc20Supply.supply());

  const handleWithdrawApprove = () => nativeWithdraw.approve();
  const handleWithdraw = () => (isWithdrawNative ? nativeWithdraw.withdraw() : erc20Withdraw.withdraw());

  // Pick the right balance based on supply mode
  const walletBalance = isSupplyNative ? nativeBalance : erc20Balance;
  const walletBalanceDisplay = address ? `${formatTokenAmount(walletBalance)} ${activeSupplySymbol}` : '—';

  const supplyApy = (Number(reserve.supplyAPY) * 100).toFixed(2);

  const userReserve = user?.userReservesData.find(
    (ur) => ur.reserve.underlyingAsset.toLowerCase() === reserve.underlyingAsset.toLowerCase()
  );
  const suppliedBalance = userReserve ? Number(userReserve.underlyingBalance) : 0;

  // ── Max withdraw calculation (per business logic doc) ──
  const maxWithdrawAmount = useMemo(() => {
    // Step 1: min(userBalance, poolAvailableLiquidity)
    const poolLiquidity = Number(reserve.availableLiquidity);
    let maxAmount = Math.min(suppliedBalance, poolLiquidity);

    // Step 2: Constrain by health factor if user has borrows AND uses this as collateral
    if (
      user &&
      userReserve &&
      reserve.usageAsCollateralEnabled &&
      userReserve.usageAsCollateralEnabledOnUser &&
      Number(user.totalBorrowsMarketReferenceCurrency) > 0
    ) {
      const excessHF = Number(user.healthFactor) - 1;
      if (excessHF > 0) {
        const reserveLiqThreshold = Number(reserve.reserveLiquidationThreshold);
        const totalCollateralInEth =
          ((excessHF * Number(user.totalBorrowsMarketReferenceCurrency)) / (reserveLiqThreshold + 0.01)) * 0.99;
        const maxByHF = totalCollateralInEth / Number(reserve.priceInMarketReferenceCurrency);
        maxAmount = Math.min(maxAmount, maxByHF);
      } else {
        // HF already <= 1, cannot withdraw any collateral
        maxAmount = 0;
      }
    }

    console.debug('[maxWithdraw] FINAL maxAmount:', maxAmount);

    // Clamp only genuine floating-point rounding artifacts (< 1e-15) to 0.
    // DO NOT clamp legitimate on-chain dust balances — users should be able to withdraw them.
    // parseEther does not accept scientific notation strings, so we return the raw number
    // and handle formatting at call sites.
    const FLOAT_ARTIFACT_THRESHOLD = 1e-15;
    return maxAmount < FLOAT_ARTIFACT_THRESHOLD ? 0 : maxAmount;
  }, [suppliedBalance, reserve, user, userReserve]);

  // ── Projected HF after withdraw ──
  const projectedWithdrawHF = useMemo(() => {
    if (!user || !withdrawAmount || Number(withdrawAmount) <= 0) return null;
    return computeNewHealthFactor('withdraw', withdrawAmount, reserve, user, marketRefPriceInUsd);
  }, [user, withdrawAmount, reserve, marketRefPriceInUsd]);

  // ── Blocking errors (per business logic doc §5) ──
  const withdrawBlockingError = useMemo(() => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return null;
    const amt = Number(withdrawAmount);

    // HF check first (only if user has borrows)
    if (user && Number(user.totalBorrowsMarketReferenceCurrency) > 0 && projectedWithdrawHF) {
      const hfNum = Number(projectedWithdrawHF);
      if (!Number.isNaN(hfNum) && projectedWithdrawHF !== '∞' && hfNum < 1) {
        return t('withdrawHfBlocked');
      }
    }

    if (amt > suppliedBalance) {
      return t('withdrawInsufficientFunds');
    }

    const poolLiquidity = Number(reserve.availableLiquidity);
    if (amt > poolLiquidity) {
      return t('withdrawInsufficientLiquidity');
    }

    return null;
  }, [withdrawAmount, suppliedBalance, reserve.availableLiquidity, user, projectedWithdrawHF]);

  // ── HF danger warning (HF < 1.5, per business logic doc §6) ──
  const isWithdrawHFDangerous = useMemo(() => {
    if (!user || Number(user.totalBorrowsMarketReferenceCurrency) === 0) return false;
    if (!projectedWithdrawHF || projectedWithdrawHF === '∞') return false;
    return Number(projectedWithdrawHF) < 1.5;
  }, [user, projectedWithdrawHF]);

  const canSupply =
    !!address &&
    !!supplyAmount &&
    Number(supplyAmount) > 0 &&
    Number(supplyAmount) <= Number(walletBalance) &&
    reserve.isActive &&
    !reserve.isFrozen;
  const canWithdraw = !!address && !!withdrawAmount && Number(withdrawAmount) > 0 && !withdrawBlockingError;

  return (
    <div className='flex flex-col gap-5'>
      {/* ── Supply section ── */}
      <Collapsible
        open={openSection === 'supply'}
        onOpenChange={(open) => setOpenSection(open ? 'supply' : 'withdraw')}
        className='flex flex-col gap-3'
      >
        <CollapsibleTrigger asChild>
          <div className='flex cursor-pointer items-center justify-between'>
            {hasNativeOption && openSection === 'supply' ? (
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type='button'
                      className='flex cursor-pointer items-center gap-2 font-semibold text-foreground transition-colors hover:text-primary'
                    >
                      {t('supplySymbol', { symbol: activeSupplySymbol })}
                      <ChevronDown size={14} className='text-muted-foreground' />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start'>
                    <DropdownMenuItem onClick={() => setSupplyMode('wrapped')}>
                      <TokenIcon symbol={reserve.symbol} size={16} />
                      {t('supplySymbol', { symbol: reserve.symbol })}
                      <span className='ml-auto text-muted-foreground text-xs'>ERC-20</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSupplyMode('native')}>
                      <TokenIcon symbol={reserve.symbol} size={16} />
                      {t('supplySymbol', { symbol: nativeSymbol })}
                      <span className='ml-auto text-muted-foreground text-xs'>Native</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <h3 className='flex items-center gap-2 font-semibold text-foreground'>
                {t('supplySymbol', { symbol: hasNativeOption ? activeSupplySymbol : reserve.symbol })}
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
            value={supplyAmount}
            onChange={setSupplyAmount}
            symbol={activeSupplySymbol}
            onMax={() => {
              if (isSupplyNative) {
                const maxNative = Math.max(Number(walletBalance) - 0.001, 0);
                setSupplyAmount(truncateInputAmount(maxNative, undefined, decimals));
              } else {
                setSupplyAmount(truncateInputAmount(walletBalance, undefined, decimals));
              }
            }}
            label={t('amount')}
            usdValue={
              supplyAmount && Number(supplyAmount) > 0
                ? Number(supplyAmount) * Number(reserve.priceInMarketReferenceCurrency) * Number(marketRefPriceInUsd)
                : undefined
            }
            disabled={isSupplyBusy}
            validate={
              isSupplyBusy
                ? undefined
                : (v) => {
                    if (!v || Number(v) <= 0) return null;
                    if (Number(v) > Number(walletBalance)) return t('insufficientBalance');
                    return null;
                  }
            }
          />
          <div className='ml-auto flex flex-col items-end'>
            <span className='flex items-center gap-1 text-muted-foreground text-xs'>
              <Wallet size={14} className='inline' /> {t('balance')}: {walletBalanceDisplay}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={12} className='cursor-help text-muted-foreground' />
                </TooltipTrigger>
                <TooltipContent side='top' className='max-w-[240px]'>
                  {t('supplyBalanceTooltip')}
                </TooltipContent>
              </Tooltip>
            </span>
            {address && (
              <span className='text-[11px] text-muted-foreground/60'>
                $
                {(
                  Number(walletBalance) *
                  Number(reserve.priceInMarketReferenceCurrency) *
                  Number(marketRefPriceInUsd)
                ).toFixed(2)}
              </span>
            )}
          </div>

          {(!reserve.isActive || reserve.isFrozen) && (
            <Alert variant='destructive'>
              <TriangleAlert className='size-4' />
              <AlertDescription className='text-xs'>
                {!reserve.isActive ? t('reserveInactive') : t('reserveFrozen')}
              </AlertDescription>
            </Alert>
          )}

          <div className='flex gap-3'>
            {!isSupplyNative && (
              <Button
                variant='outline'
                className='flex-1'
                icon={
                  erc20Supply.status === 'approving' || erc20Supply.status === 'confirming-approve' ? (
                    <Loader2 size={14} className='animate-spin' />
                  ) : (
                    <Lock size={14} />
                  )
                }
                onClick={handleApprove}
                disabled={!canSupply || isSupplyBusy || !erc20Supply.needsApproval}
              >
                {erc20Supply.status === 'approving'
                  ? t('signing')
                  : erc20Supply.status === 'confirming-approve'
                    ? t('confirming')
                    : erc20Supply.needsApproval
                      ? t('approve')
                      : t('approved')}
              </Button>
            )}
            <Button
              className='flex-1'
              icon={
                supplyStatus === 'supplying' ||
                supplyStatus === 'confirming-supply' ||
                supplyStatus === 'confirming' ? (
                  <Loader2 size={14} className='animate-spin' />
                ) : (
                  <ArrowUpToLine size={14} />
                )
              }
              onClick={handleSupply}
              disabled={!canSupply || isSupplyBusy || (!isSupplyNative && erc20Supply.needsApproval)}
            >
              {supplyStatus === 'supplying'
                ? t('signing')
                : supplyStatus === 'confirming-supply' || supplyStatus === 'confirming'
                  ? t('confirming')
                  : t('supply')}
            </Button>
          </div>

          {supplyStatus === 'success' && !successInfo && (
            <p className='font-medium text-emerald-600 text-xs'>{t('supplyConfirmed')}</p>
          )}

          {/* ── Success Dialog ── */}
          <SupplySuccessDialog
            open={!!successInfo && successInfo.type === 'supply'}
            onClose={() => {
              setSuccessInfo(null);
              erc20Supply.reset();
              nativeSupply.reset();
            }}
            amount={successInfo?.amount ?? '0'}
            symbol={successInfo?.symbol ?? reserve.symbol}
            reserveSymbol={reserve.symbol}
            txHash={successInfo?.txHash}
            explorerUrl={explorerUrl}
            aTokenAddress={reserve.aTokenAddress as `0x${string}`}
            decimals={decimals}
          />

          <div className='flex flex-col gap-2 rounded-xs border border-border p-3'>
            {!isSupplyNative && (
              <InfoRow
                label={t('currentAllowance')}
                value={
                  Number(erc20Supply.allowance) > 1e15
                    ? `∞ ${reserve.symbol}`
                    : `${formatTokenAmount(erc20Supply.allowance)} ${reserve.symbol}`
                }
              />
            )}
            <InfoRow label={t('supplyApy')} value={`${supplyApy}%`} valueColor='text-emerald-600' />
            <InfoRow
              label={t('collateralization')}
              value={reserve.usageAsCollateralEnabled ? t('enabled') : t('disabled')}
              valueColor={reserve.usageAsCollateralEnabled ? 'text-emerald-600' : 'text-muted-foreground'}
            />
            {user && Number(user.totalBorrowsMarketReferenceCurrency) > 0 && reserve.usageAsCollateralEnabled && (
              <InfoRow
                label={t('newHealthFactor')}
                value={
                  <HealthFactorDisplay
                    currentHf={Number(user.healthFactor).toFixed(2)}
                    newHf={
                      supplyAmount && Number(supplyAmount) > 0
                        ? computeNewHealthFactor('supply', supplyAmount, reserve, user, marketRefPriceInUsd)
                        : EM_DASH
                    }
                  />
                }
              />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* ── Withdraw section ── */}
      <Collapsible
        open={openSection === 'withdraw'}
        onOpenChange={(open) => setOpenSection(open ? 'withdraw' : 'supply')}
        className='flex flex-col gap-3'
      >
        <CollapsibleTrigger asChild>
          <div className='flex cursor-pointer items-center justify-between'>
            {hasNativeOption && openSection === 'withdraw' ? (
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type='button'
                      className='flex cursor-pointer items-center gap-2 font-semibold text-foreground transition-colors hover:text-primary'
                    >
                      {t('withdrawSymbol', { symbol: activeWithdrawSymbol })}
                      <ChevronDown size={14} className='text-muted-foreground' />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start'>
                    <DropdownMenuItem onClick={() => setWithdrawMode('wrapped')}>
                      <TokenIcon symbol={reserve.symbol} size={16} />
                      {t('withdrawSymbol', { symbol: reserve.symbol })}
                      <span className='ml-auto text-muted-foreground text-xs'>{t('erc20')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setWithdrawMode('native')}>
                      <TokenIcon symbol={reserve.symbol} size={16} />
                      {t('withdrawSymbol', { symbol: nativeSymbol })}
                      <span className='ml-auto text-muted-foreground text-xs'>{t('native')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <h3 className='flex items-center gap-2 font-semibold text-foreground'>
                {t('withdrawSymbol', { symbol: hasNativeOption ? activeWithdrawSymbol : reserve.symbol })}
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
            value={withdrawAmount}
            onChange={(v) => {
              setWithdrawAmount(v);
              setIsMaxWithdraw(false);
              setIsMaxWithdrawSelected(false);
            }}
            symbol={activeWithdrawSymbol}
            onMax={() => {
              setWithdrawAmount(truncateInputAmount(maxWithdrawAmount, undefined, decimals));
              setIsMaxWithdrawSelected(true);
              // Only use MAX_UINT256 if user has no borrows (safe to withdraw all including interest)
              const hasBorrows = user && Number(user.totalBorrowsMarketReferenceCurrency) > 0;
              setIsMaxWithdraw(!hasBorrows && maxWithdrawAmount >= suppliedBalance);
            }}
            label={t('withdrawalAmount')}
            usdValue={
              withdrawAmount && Number(withdrawAmount) > 0
                ? Number(withdrawAmount) * Number(reserve.priceInMarketReferenceCurrency) * Number(marketRefPriceInUsd)
                : undefined
            }
            disabled={isWithdrawBusy}
            validate={
              isWithdrawBusy
                ? undefined
                : (v) => {
                    if (!v || Number(v) <= 0) return null;
                    if (!isMaxWithdrawSelected && Number(v) > maxWithdrawAmount) return t('exceedsMaxWithdraw');
                    return null;
                  }
            }
          />
          <span className='ml-auto text-muted-foreground text-xs'>
            <Landmark size={14} className='inline' /> {t('suppliedAmount')}:{' '}
            {formatTokenAmount(suppliedBalance, suppliedBalance > 0 && suppliedBalance < 0.0001 ? 8 : 4)}{' '}
            {reserve.symbol}
          </span>

          {!isWithdrawBusy && withdrawBlockingError && (
            <Alert variant='destructive'>
              <TriangleAlert className='size-4' />
              <AlertDescription className='text-xs'>{withdrawBlockingError}</AlertDescription>
            </Alert>
          )}

          {isWithdrawHFDangerous && !withdrawBlockingError && (
            <Alert variant='warning'>
              <TriangleAlert className='size-4' />
              <AlertDescription className='text-xs'>
                {t('withdrawHfDanger', { hf: projectedWithdrawHF ?? '' })}
              </AlertDescription>
            </Alert>
          )}

          {user &&
            Number(user.totalBorrowsMarketReferenceCurrency) > 0 &&
            reserve.usageAsCollateralEnabled &&
            !withdrawBlockingError &&
            !isWithdrawHFDangerous && (
              <Alert variant='warning'>
                <TriangleAlert className='size-4' />
                <AlertDescription className='text-xs'>{t('withdrawHfWarning')}</AlertDescription>
              </Alert>
            )}

          <div className='flex gap-3'>
            {isWithdrawNative && (
              <Button
                variant='outline'
                className='flex-1'
                icon={
                  nativeWithdraw.status === 'approving' || nativeWithdraw.status === 'confirming-approve' ? (
                    <Loader2 size={14} className='animate-spin' />
                  ) : (
                    <Lock size={14} />
                  )
                }
                onClick={handleWithdrawApprove}
                disabled={!canWithdraw || isWithdrawBusy || !nativeWithdraw.needsApproval}
              >
                {nativeWithdraw.status === 'approving'
                  ? t('signing')
                  : nativeWithdraw.status === 'confirming-approve'
                    ? t('confirming')
                    : nativeWithdraw.needsApproval
                      ? t('approveAToken')
                      : t('approved')}
              </Button>
            )}
            <Button
              variant='outline'
              className='flex-1'
              icon={
                withdrawStatus === 'withdrawing' || withdrawStatus === 'confirming' ? (
                  <Loader2 size={14} className='animate-spin' />
                ) : (
                  <ArrowDownToLine size={14} />
                )
              }
              onClick={handleWithdraw}
              disabled={!canWithdraw || isWithdrawBusy || (isWithdrawNative && nativeWithdraw.needsApproval)}
            >
              {withdrawStatus === 'withdrawing'
                ? t('signing')
                : withdrawStatus === 'confirming'
                  ? t('confirming')
                  : t('withdraw')}
            </Button>
          </div>

          {withdrawStatus === 'success' && !successInfo && (
            <p className='font-medium text-emerald-600 text-xs'>{t('withdrawConfirmed')}</p>
          )}

          {/* ── Withdraw Success Dialog ── */}
          <WithdrawSuccessDialog
            open={!!successInfo && successInfo.type === 'withdraw'}
            onClose={() => {
              setSuccessInfo(null);
              erc20Withdraw.reset();
              nativeWithdraw.reset();
            }}
            amount={successInfo?.amount ?? '0'}
            symbol={successInfo?.symbol ?? reserve.symbol}
            txHash={successInfo?.txHash}
            explorerUrl={explorerUrl}
          />

          <div className='flex flex-col gap-2 rounded-xs border border-border p-3'>
            {isWithdrawNative && (
              <InfoRow
                label={t('currentAllowance')}
                value={
                  Number(nativeWithdraw.allowance) > 1e15
                    ? `∞ a${reserve.symbol}`
                    : `${formatTokenAmount(nativeWithdraw.allowance)} a${reserve.symbol}`
                }
              />
            )}
            <InfoRow
              label={t('remainingSupply')}
              value={
                withdrawAmount && Number(withdrawAmount) > 0 ? (
                  <span className='flex items-center gap-1'>
                    <span>{formatTokenAmount(suppliedBalance)}</span>
                    <span className='text-muted-foreground'>→</span>
                    <span className='font-semibold'>
                      {formatTokenAmount(
                        isMaxWithdrawSelected && maxWithdrawAmount >= suppliedBalance
                          ? 0
                          : Math.max(suppliedBalance - Number(withdrawAmount), 0)
                      )}
                    </span>
                    <span className='text-muted-foreground'>{reserve.symbol}</span>
                  </span>
                ) : (
                  `${formatTokenAmount(suppliedBalance)} ${reserve.symbol}`
                )
              }
            />
            {user && Number(user.totalBorrowsMarketReferenceCurrency) > 0 && reserve.usageAsCollateralEnabled && (
              <InfoRow
                label={t('newHealthFactor')}
                value={
                  <HealthFactorDisplay
                    currentHf={Number(user.healthFactor).toFixed(2)}
                    newHf={
                      withdrawAmount && Number(withdrawAmount) > 0
                        ? computeNewHealthFactor('withdraw', withdrawAmount, reserve, user, marketRefPriceInUsd)
                        : EM_DASH
                    }
                  />
                }
              />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
