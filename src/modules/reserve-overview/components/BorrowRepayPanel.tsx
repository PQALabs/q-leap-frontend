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
import { isFeatureEnabled } from '@/helpers/config/markets-and-network-config';
import { useBorrow } from '@/hooks/use-borrow';
import { useBorrowNative } from '@/hooks/use-borrow-native';
import { useRepay } from '@/hooks/use-repay';
import { useRepayNative } from '@/hooks/use-repay-native';
import { computeNewHealthFactor } from '@/lib/compute-health-factor';
import { useProtocolDataContext } from '@/providers/protocol-data-provider';
import type { ComputedReserveData, UserSummary } from '@/stores/use-pool-data-store';
import { usePoolDataStore } from '@/stores/use-pool-data-store';
import { formatTokenAmount } from '@/utils/format';
import { AmountInput } from './AmountInput';
import { BorrowSuccessDialog } from './BorrowSuccessDialog';
import { RepaySuccessDialog } from './RepaySuccessDialog';
import { RepayWithCollateralPanel } from './RepayWithCollateralPanel';
import { HealthFactorDisplay, InfoRow, TokenIcon } from './ReserveActionHelpers';

/** Whether this reserve supports native token borrow (WQDAY ↔ QDAY) */
const NATIVE_WRAP_MAP: Record<string, string> = {
  WQDAY: 'QDAY',
};

const GAS_BUFFER_NATIVE = 0.001;

type BorrowMode = 'wrapped' | 'native';
type RepayMode = 'wrapped' | 'native';

interface BorrowRepayPanelProps {
  reserve: ComputedReserveData;
  user: UserSummary | undefined;
  marketRefPriceInUsd: string;
}

type RepaySource = 'wallet' | 'collateral';

export function BorrowRepayPanel({ reserve, user, marketRefPriceInUsd }: BorrowRepayPanelProps) {
  const [borrowAmount, setBorrowAmount] = useState('');
  const [isMaxBorrowSelected, setIsMaxBorrowSelected] = useState(false);
  const [repayAmount, setRepayAmount] = useState('');
  const [isRepayMax, setIsRepayMax] = useState(false);
  const [repaySource, setRepaySource] = useState<RepaySource>('wallet');
  const searchParams = useSearchParams();
  const actionParam = searchParams.get('action');
  const [openSection, setOpenSection] = useState<'borrow' | 'repay'>(actionParam === 'repay' ? 'repay' : 'borrow');
  const { currentMarketData } = useProtocolDataContext();
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
  const tt = useTranslations('modules.market.Toasts');
  const refresh = usePoolDataStore.use.refresh();
  const networkConfig = usePoolDataStore.use.networkConfig();
  const explorerUrl = networkConfig?.explorerLink;

  // ── Feature flags ──
  const collateralRepayEnabled = !!isFeatureEnabled.collateralRepay(currentMarketData);

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
    toastLabels: {
      borrowConfirmed: tt('borrowConfirmed'),
      borrowConfirmedDesc: tt('borrowConfirmedDesc', { amount: borrowAmount, symbol: activeBorrowSymbol }),
      borrowFailed: tt('borrowFailed'),
      borrowReverted: tt('borrowReverted'),
      waitingBorrowSignature: tt('waitingBorrowSignature'),
      confirmingBorrow: tt('confirmingBorrow'),
      txFailed: tt('txFailed'),
    },
  });

  const nativeBorrow = useBorrowNative({
    variableDebtTokenAddress: reserve.variableDebtTokenAddress as `0x${string}`,
    userAddress: address,
    amount: borrowAmount,
    onSuccess: onTxSuccess,
    toastLabels: {
      delegationConfirmed: tt('delegationConfirmed'),
      delegationConfirmedDesc: tt('delegationConfirmedDesc'),
      delegationFailed: tt('delegationFailed'),
      delegationReverted: tt('delegationReverted'),
      waitingDelegationSignature: tt('waitingDelegationSignature'),
      confirmingDelegation: tt('confirmingDelegation'),
      borrowConfirmed: tt('borrowConfirmed'),
      borrowConfirmedDesc: tt('borrowConfirmedDesc', { amount: borrowAmount, symbol: activeBorrowSymbol }),
      borrowFailed: tt('borrowFailed'),
      borrowReverted: tt('borrowReverted'),
      waitingBorrowSignature: tt('waitingBorrowSignature'),
      confirmingBorrow: tt('confirmingBorrow'),
      txFailed: tt('txFailed'),
    },
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

  const handleBorrowDelegation = useCallback(() => nativeBorrow.approveDelegation(), [nativeBorrow]);
  const handleBorrow = useCallback(
    () => (isBorrowNative ? nativeBorrow.borrow() : erc20Borrow.borrow()),
    [isBorrowNative, nativeBorrow, erc20Borrow]
  );
  const handleRepayApprove = useCallback(() => erc20Repay.approve(), [erc20Repay]);
  const handleRepay = useCallback(
    () => (isRepayNative ? nativeRepay.repay() : erc20Repay.repay()),
    [isRepayNative, nativeRepay, erc20Repay]
  );

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

  // ── Projected HF after borrow ──
  const projectedBorrowHF = useMemo(() => {
    if (!user || !borrowAmount || Number(borrowAmount) <= 0) return null;
    return computeNewHealthFactor('borrow', borrowAmount, reserve, user, marketRefPriceInUsd);
  }, [user, borrowAmount, reserve, marketRefPriceInUsd]);

  // ── Blocking errors (per business-logic doc §5) ──
  const borrowBlockingError = useMemo(() => {
    if (!borrowAmount || Number(borrowAmount) <= 0) return null;
    const amt = Number(borrowAmount);

    let error: string | null = null;

    if (!reserve.borrowingEnabled) {
      error = t('borrowingNotAvailable');
    }

    if (user && !isMaxBorrowSelected && amt > maxBorrowAmount * 1.001) {
      error = t('insufficientCollateral');
    }

    if (amt > Number(reserve.availableLiquidity)) {
      error = t('insufficientLiquidity', { symbol: reserve.symbol });
    }

    if (user && Number(user.totalBorrowsMarketReferenceCurrency) > 0 && projectedBorrowHF) {
      const hfNum = Number(projectedBorrowHF);
      if (!Number.isNaN(hfNum) && projectedBorrowHF !== '∞' && hfNum < 1) {
        error = t('hfBelowOne');
      }
    }

    return error;
  }, [borrowAmount, reserve, user, maxBorrowAmount, projectedBorrowHF, isMaxBorrowSelected, t]);

  // ── HF danger warning (HF < 1.5) ──
  const isBorrowHFDangerous = useMemo(() => {
    if (!projectedBorrowHF || projectedBorrowHF === '∞') return false;
    return Number(projectedBorrowHF) < 1.5;
  }, [projectedBorrowHF]);

  const canBorrow =
    !!address &&
    !!borrowAmount &&
    Number(borrowAmount) > 0 &&
    !borrowBlockingError &&
    reserve.borrowingEnabled &&
    reserve.isActive &&
    !reserve.isFrozen;

  // ── Section toggle handlers ──
  const handleBorrowSectionToggle = useCallback((open: boolean) => setOpenSection(open ? 'borrow' : 'repay'), []);
  const handleRepaySectionToggle = useCallback((open: boolean) => setOpenSection(open ? 'repay' : 'borrow'), []);

  // ── Borrow mode dropdown handlers ──
  const handleSetBorrowModeWrapped = useCallback(() => setBorrowMode('wrapped'), []);
  const handleSetBorrowModeNative = useCallback(() => setBorrowMode('native'), []);

  // ── Repay mode dropdown handlers ──
  const handleSetRepayModeWrapped = useCallback(() => setRepayMode('wrapped'), []);
  const handleSetRepayModeNative = useCallback(() => setRepayMode('native'), []);

  // ── Repay source handlers ──
  const handleSetRepaySourceWallet = useCallback(() => setRepaySource('wallet'), []);
  const handleSetRepaySourceCollateral = useCallback(() => setRepaySource('collateral'), []);

  // ── Borrow amount handlers (also clears revert error on change) ──
  const handleBorrowAmountChange = useCallback(
    (v: string) => {
      setBorrowAmount(v);
      setIsMaxBorrowSelected(false);
      // Clear the last on-chain error so the alert disappears when user edits input
      erc20Borrow.reset();
    },
    [erc20Borrow]
  );
  const handleBorrowMax = useCallback(() => {
    setBorrowAmount(maxBorrowAmount.toString());
    setIsMaxBorrowSelected(true);
  }, [maxBorrowAmount]);
  const validateBorrowAmount = useCallback(
    (v: string) => {
      if (!v || Number(v) <= 0) return null;
      if (!isMaxBorrowSelected && Number(v) > maxBorrowAmount) return t('exceedsMaxBorrow');
      return null;
    },
    [isMaxBorrowSelected, maxBorrowAmount, t]
  );

  // ── Repay amount handlers ──
  const handleRepayAmountChange = useCallback((v: string) => {
    setRepayAmount(v);
    setIsRepayMax(false);
  }, []);
  const handleRepayMax = useCallback(() => {
    // Max repay = min(wallet balance, debt)
    const maxRepay = Math.min(Number(repayWalletBalance), borrowedBalance);
    // isRepayMax = user intends to repay ALL debt (wallet can cover it)
    const wantsFullRepay = Number(repayWalletBalance) >= borrowedBalance;
    let repayAmt: number;
    if (isRepayNative) {
      // For native (QDAY), reserve a small gas buffer ONLY when wallet covers debt.
      // If debt itself is tiny (≤ buffer), still repay the full debt amount — the
      // contract will use type(uint256).max to sweep accrued interest.
      if (wantsFullRepay && Number(repayWalletBalance) - borrowedBalance >= GAS_BUFFER_NATIVE) {
        // wallet has plenty, just repay the debt; buffer comes from the surplus
        repayAmt = borrowedBalance;
      } else if (!wantsFullRepay && Number(repayWalletBalance) > GAS_BUFFER_NATIVE) {
        // wallet is the cap, reserve gas from the wallet side
        repayAmt = Number(repayWalletBalance) - GAS_BUFFER_NATIVE;
      } else {
        // wallet ≤ buffer or very tiny amounts — use all we can
        repayAmt = maxRepay;
      }
    } else {
      repayAmt = maxRepay;
    }
    setRepayAmount(repayAmt.toString());
    // Set isRepayMax=true when user wants to clear the full debt so the
    // contract receives type(uint256).max and handles interest accrued since fetch.
    setIsRepayMax(wantsFullRepay);
  }, [repayWalletBalance, borrowedBalance, isRepayNative]);

  const validateRepayAmount = useCallback(
    (v: string) => {
      if (!v || Number(v) <= 0) return null;
      if (Number(v) > Number(repayWalletBalance)) return t('insufficientWalletBalance');
      if (Number(v) > borrowedBalance) return t('exceedsRemainingDebt');
      return null;
    },
    [repayWalletBalance, borrowedBalance, t]
  );

  // ── Dialog close handlers ──
  const handleBorrowSuccessClose = useCallback(() => {
    setBorrowSuccessInfo(null);
    erc20Borrow.reset();
    nativeBorrow.reset();
  }, [erc20Borrow, nativeBorrow]);

  const handleRepaySuccessClose = useCallback(() => {
    setRepaySuccessInfo(null);
    erc20Repay.reset();
    nativeRepay.reset();
  }, [erc20Repay, nativeRepay]);

  // ── Borrow trigger stopPropagation ──
  const handleBorrowDropdownStopPropagation = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);
  const handleRepayDropdownStopPropagation = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  // ── Computed values for display ──
  const borrowUsdValue = useMemo(
    () =>
      borrowAmount && Number(borrowAmount) > 0
        ? Number(borrowAmount) * Number(reserve.priceInMarketReferenceCurrency) * Number(marketRefPriceInUsd)
        : undefined,
    [borrowAmount, reserve.priceInMarketReferenceCurrency, marketRefPriceInUsd]
  );

  const repayUsdValue = useMemo(
    () =>
      repayAmount && Number(repayAmount) > 0
        ? Number(repayAmount) * Number(reserve.priceInMarketReferenceCurrency) * Number(marketRefPriceInUsd)
        : undefined,
    [repayAmount, reserve.priceInMarketReferenceCurrency, marketRefPriceInUsd]
  );

  const borrowedBalanceUsd = useMemo(
    () => (borrowedBalance * Number(reserve.priceInMarketReferenceCurrency) * Number(marketRefPriceInUsd)).toFixed(2),
    [borrowedBalance, reserve.priceInMarketReferenceCurrency, marketRefPriceInUsd]
  );

  const remainingDebtAfterRepayUsd = useMemo(() => {
    if (!repayAmount || Number(repayAmount) <= 0) return null;
    return (
      Math.max(borrowedBalance - Number(repayAmount), 0) *
      Number(reserve.priceInMarketReferenceCurrency) *
      Number(marketRefPriceInUsd)
    ).toFixed(2);
  }, [repayAmount, borrowedBalance, reserve.priceInMarketReferenceCurrency, marketRefPriceInUsd]);

  const newBorrowHf = useMemo(
    () =>
      user && borrowAmount && Number(borrowAmount) > 0
        ? computeNewHealthFactor('borrow', borrowAmount, reserve, user, marketRefPriceInUsd)
        : EM_DASH,
    [borrowAmount, reserve, user, marketRefPriceInUsd]
  );

  const newRepayHf = useMemo(
    () =>
      user && repayAmount && Number(repayAmount) > 0
        ? computeNewHealthFactor('repay', repayAmount, reserve, user, marketRefPriceInUsd)
        : EM_DASH,
    [repayAmount, reserve, user, marketRefPriceInUsd]
  );

  const maxBorrowUsd = useMemo(
    () => (maxBorrowAmount * Number(reserve.priceInMarketReferenceCurrency) * Number(marketRefPriceInUsd)).toFixed(2),
    [maxBorrowAmount, reserve.priceInMarketReferenceCurrency, marketRefPriceInUsd]
  );

  const nativeDelegationAllowanceDisplay = useMemo(
    () =>
      Number(nativeBorrow.delegationAllowance) > 1e15
        ? t('delegationApproved')
        : `${formatTokenAmount(nativeBorrow.delegationAllowance)} ${reserve.symbol}`,
    [nativeBorrow.delegationAllowance, reserve.symbol, t]
  );

  const erc20AllowanceDisplay = useMemo(
    () =>
      Number(erc20Repay.allowance) > 1e15
        ? `∞ ${reserve.symbol}`
        : `${formatTokenAmount(erc20Repay.allowance)} ${reserve.symbol}`,
    [erc20Repay.allowance, reserve.symbol]
  );

  const remainingDebtDisplay = useMemo(() => {
    if (repayAmount && Number(repayAmount) > 0) {
      return (
        <span className='flex items-center gap-1'>
          <span>{formatTokenAmount(borrowedBalance)}</span>
          <span className='text-muted-foreground'>→</span>
          <span className='font-semibold'>{formatTokenAmount(Math.max(borrowedBalance - Number(repayAmount), 0))}</span>
          <span className='text-muted-foreground'>{reserve.symbol}</span>
        </span>
      );
    }
    return `${formatTokenAmount(borrowedBalance)} ${reserve.symbol}`;
  }, [repayAmount, borrowedBalance, reserve.symbol]);

  const remainingDebtUsdDisplay = useMemo(() => {
    if (!repayAmount || Number(repayAmount) <= 0) {
      return <>${borrowedBalanceUsd}</>;
    }
    return (
      <>
        ${borrowedBalanceUsd}
        {' → $'}
        {remainingDebtAfterRepayUsd}
      </>
    );
  }, [repayAmount, borrowedBalanceUsd, remainingDebtAfterRepayUsd]);

  return (
    <div className='flex flex-col gap-5'>
      {/* ── Borrow section ── */}
      <Collapsible
        open={openSection === 'borrow'}
        onOpenChange={handleBorrowSectionToggle}
        className='flex flex-col gap-3'
      >
        <CollapsibleTrigger asChild>
          <div className='flex cursor-pointer items-center justify-between'>
            {hasNativeOption && openSection === 'borrow' ? (
              <div onClick={handleBorrowDropdownStopPropagation}>
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
                    <DropdownMenuItem onClick={handleSetBorrowModeWrapped}>
                      <TokenIcon symbol={reserve.symbol} size={16} />
                      {t('borrowSymbol', { symbol: reserve.symbol })}
                      <span className='ml-auto text-muted-foreground text-xs'>{t('erc20')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSetBorrowModeNative}>
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
            onChange={handleBorrowAmountChange}
            symbol={activeBorrowSymbol}
            onMax={handleBorrowMax}
            label={t('amount')}
            usdValue={borrowUsdValue}
            validate={validateBorrowAmount}
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
            <span className='text-[11px] text-muted-foreground/60'>${maxBorrowUsd}</span>
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
            onClose={handleBorrowSuccessClose}
            amount={borrowSuccessInfo?.amount ?? '0'}
            symbol={borrowSuccessInfo?.symbol ?? reserve.symbol}
            txHash={borrowSuccessInfo?.txHash}
            explorerUrl={explorerUrl}
          />

          <div className='flex flex-col gap-2 rounded-xs border border-border p-3'>
            {isBorrowNative && <InfoRow label={t('debtDelegation')} value={nativeDelegationAllowanceDisplay} />}
            <InfoRow label={t('borrowApyVariable')} value={`${variableBorrowApy}%`} valueColor='text-red-500' />
            <InfoRow
              label={t('healthFactor')}
              value={
                user ? (
                  <div className='flex flex-col items-end gap-0.5'>
                    <HealthFactorDisplay currentHf={Number(user.healthFactor).toFixed(2)} newHf={newBorrowHf} />
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
        onOpenChange={handleRepaySectionToggle}
        className='flex flex-col gap-3'
      >
        <CollapsibleTrigger asChild>
          <div className='flex cursor-pointer items-center justify-between'>
            {hasNativeOption && openSection === 'repay' ? (
              <div onClick={handleRepayDropdownStopPropagation}>
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
                    <DropdownMenuItem onClick={handleSetRepayModeWrapped}>
                      <TokenIcon symbol={reserve.symbol} />
                      {reserve.symbol}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSetRepayModeNative}>
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
          {/* ── Repay Source Toggle (Wallet vs Collateral) ── */}
          {collateralRepayEnabled && borrowedBalance > 0 && user && (
            <div className='flex rounded-md border border-border p-0.5'>
              <button
                type='button'
                onClick={handleSetRepaySourceWallet}
                className={`flex-1 rounded-sm py-1 font-medium text-xs transition-colors ${
                  repaySource === 'wallet'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                From Wallet
              </button>
              <button
                type='button'
                onClick={handleSetRepaySourceCollateral}
                className={`flex-1 rounded-sm py-1 font-medium text-xs transition-colors ${
                  repaySource === 'collateral'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                With Collateral
              </button>
            </div>
          )}

          {/* ── Repay With Collateral ── */}
          {repaySource === 'collateral' && collateralRepayEnabled && user ? (
            <RepayWithCollateralPanel
              debtReserve={reserve}
              user={user}
              marketRefPriceInUsd={marketRefPriceInUsd}
              userAddress={address}
              onSuccess={onTxSuccess}
            />
          ) : (
            <>
              <AmountInput
                value={repayAmount}
                onChange={handleRepayAmountChange}
                symbol={activeRepaySymbol}
                onMax={handleRepayMax}
                label={t('repayAmount')}
                usdValue={repayUsdValue}
                validate={validateRepayAmount}
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
                onClose={handleRepaySuccessClose}
                amount={repaySuccessInfo?.amount ?? '0'}
                symbol={repaySuccessInfo?.symbol ?? reserve.symbol}
                txHash={repaySuccessInfo?.txHash}
                explorerUrl={explorerUrl}
              />

              <div className='flex flex-col gap-2 rounded-xs border border-border p-3'>
                {!isRepayNative && <InfoRow label={t('currentAllowance')} value={erc20AllowanceDisplay} />}
                <InfoRow
                  className='items-baseline'
                  label={t('remainingDebt')}
                  value={
                    <div className='flex flex-col items-end gap-0.5'>
                      <span className='font-medium text-foreground text-sm'>{remainingDebtDisplay}</span>
                      <span className='text-[11px] text-muted-foreground'>{remainingDebtUsdDisplay}</span>
                    </div>
                  }
                />
                <InfoRow label={t('borrowApyVariable')} value={`${variableBorrowApy}%`} />
                <InfoRow
                  label={t('healthFactor')}
                  value={
                    user ? (
                      <div className='flex flex-col items-end gap-0.5'>
                        <HealthFactorDisplay currentHf={Number(user.healthFactor).toFixed(2)} newHf={newRepayHf} />
                        <span className='text-[11px] text-muted-foreground'>{t('liquidationAtOne')}</span>
                      </div>
                    ) : (
                      EM_DASH
                    )
                  }
                />
              </div>
            </>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
