'use client';

/**
 * RepayWithCollateralPanel
 *
 * UI panel for the "Repay with Collateral" feature.
 * Users select a deposited collateral asset and enter how much debt to repay.
 * The adapter swaps the collateral for the debt asset via Uniswap V3 on-chain.
 *
 * Key behaviors:
 * - Fetches an on-chain V3 quote (getAmountsIn via simulateContract)
 * - Shows exact collateral needed + slippage buffer
 * - Approves aToken to the adapter, then calls swapAndRepay (direct) or flashLoan
 * - Flash loan is auto-selected when HF would drop to <= 1.01 during collateral pull
 *
 * Data sources:
 * - `user` (UserSummary): ComputedUserReserve[] for balances (underlyingBalance, totalBorrows)
 * - `rawUserReserves` (from pool store): UserReserveDataExtended[] for reserve metadata (aTokenAddress)
 */

import { AlertTriangle, ArrowRight, ChevronDown, Info, Loader2, Lock, RefreshCw, Zap } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { formatUnits } from 'viem';
import { useReadErc20BalanceOf } from '@/abi/generated';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFormattedPoolData } from '@/hooks/use-formatted-pool-data';
import { useRepayWithCollateral } from '@/hooks/use-repay-with-collateral';
import { computeNewHealthFactor } from '@/lib/compute-health-factor';
import { calculateHealthFactorFromBalancesBigUnits, valueToBigNumber } from '@/math-utils';
import type { ComputedReserveData, UserReserveDataExtended, UserSummary } from '@/stores/use-pool-data-store';
import { usePoolDataStore } from '@/stores/use-pool-data-store';
import { formatTokenAmount } from '@/utils/format';
import { AmountInput } from './AmountInput';
import { HealthFactorDisplay, InfoRow, TokenIcon } from './ReserveActionHelpers';

// Tokens excluded from collateral repay (matches Aave V2 UI guide)
const EXCLUDED_COLLATERAL_TOKENS = ['XSUSHI', 'GUSD', 'BUSD', 'SUSD', 'BAL', 'KNC', 'ZRX'];

const SLIPPAGE_PRESETS = [
  { label: '0.5%', value: 50 },
  { label: '1%', value: 100 },
  { label: '2%', value: 200 },
  { label: '3%', value: 300 },
];

interface RepayWithCollateralPanelProps {
  /** The reserve being repaid */
  debtReserve: ComputedReserveData;
  /** User summary with computed balances */
  user: UserSummary;
  /** Market reference price in USD */
  marketRefPriceInUsd: string;
  /** User wallet address */
  userAddress: `0x${string}` | undefined;
  /** Callback after successful repay */
  onSuccess?: () => void;
}

export function RepayWithCollateralPanel({
  debtReserve,
  user,
  marketRefPriceInUsd,
  userAddress,
  onSuccess,
}: RepayWithCollateralPanelProps) {
  const [debtAmount, setDebtAmount] = useState('');
  const [isMaxDebt, setIsMaxDebt] = useState(false);
  const [slippageBps, setSlippageBps] = useState(200); // default 2%
  const [selectedCollateral, setSelectedCollateral] = useState<UserReserveDataExtended | null>(null);

  // ── Get enriched user reserve data from the pool store ───────────────────
  // rawUserReservesWithBase has UserReserveDataExtended (with reserve: ReserveDataHumanized)
  // which includes aTokenAddress — unlike user.userReservesData (ComputedUserReserve[])
  const rawUserReservesWithBase = usePoolDataStore.use.rawUserReservesWithBase();

  // ── Get normalized ComputedReserveData for price calculations ────────────
  // IMPORTANT: activeCollateral.reserve is ReserveDataHumanized (raw, unnormalized price).
  // We MUST use ComputedReserveData.priceInMarketReferenceCurrency (normalized) for any
  // USD math that compares against user.totalCollateralUSD / user.totalBorrowsUSD,
  // because those are computed via formatUserSummary which uses normalized prices.
  const { reserves: formattedReserves } = useFormattedPoolData();

  // ── Available collateral assets ──────────────────────────────────────────
  // Filter: has aToken balance > 0, not same as debt asset, not excluded
  const availableCollaterals = useMemo(() => {
    if (!rawUserReservesWithBase) return [];
    return rawUserReservesWithBase.filter((ur) => {
      const sym = ur.reserve.symbol.toUpperCase();
      const isSameAsDebt = ur.reserve.underlyingAsset.toLowerCase() === debtReserve.underlyingAsset.toLowerCase();
      const hasBalance = Number(ur.scaledATokenBalance) > 0;
      const notExcluded = !EXCLUDED_COLLATERAL_TOKENS.includes(sym);
      return !isSameAsDebt && hasBalance && notExcluded;
    });
  }, [rawUserReservesWithBase, debtReserve]);

  // Cross-reference with user's ComputedUserReserve for actual balance figures
  const getComputedBalance = useCallback(
    (underlyingAsset: string): string => {
      const computed = user.userReservesData.find(
        (ur) => ur.reserve.underlyingAsset.toLowerCase() === underlyingAsset.toLowerCase()
      );
      return computed?.underlyingBalance ?? '0';
    },
    [user]
  );

  const activeCollateral = selectedCollateral ?? availableCollaterals[0] ?? null;
  const activeCollateralComputedBalance = activeCollateral
    ? getComputedBalance(activeCollateral.reserve.underlyingAsset)
    : '0';

  // Lookup the NORMALIZED ComputedReserveData for the selected collateral.
  // This is required for correct USD price math (priceInMarketReferenceCurrency is normalized here).
  const activeCollateralFormatted = useMemo(
    () =>
      activeCollateral
        ? (formattedReserves.find(
            (r) => r.underlyingAsset.toLowerCase() === activeCollateral.reserve.underlyingAsset.toLowerCase()
          ) ?? null)
        : null,
    [activeCollateral, formattedReserves]
  );

  // ── Current debt balance ─────────────────────────────────────────────────
  const userDebtComputed = user.userReservesData.find(
    (ur) => ur.reserve.underlyingAsset.toLowerCase() === debtReserve.underlyingAsset.toLowerCase()
  );
  const maxDebtToRepay = Number(userDebtComputed?.totalBorrows ?? 0);

  // ── aToken balance for selected collateral (on-chain confirmation) ────────
  const { data: aTokenBalRaw } = useReadErc20BalanceOf({
    address: activeCollateral?.reserve.aTokenAddress as `0x${string}` | undefined,
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress && !!activeCollateral, refetchInterval: 5000 },
  });

  const collateralATokenBalance = useMemo(() => {
    if (aTokenBalRaw == null || !activeCollateral) return activeCollateralComputedBalance;
    return formatUnits(aTokenBalRaw, activeCollateral.reserve.decimals);
  }, [aTokenBalRaw, activeCollateral, activeCollateralComputedBalance]);

  // ── Health Factor impact of pulling collateral (before repay) ────────────
  // Used to determine if flash loan is needed:
  //   needFlashLoan = HF_if_collateral_pulled_first <= 1.01
  //
  // We estimate collateral removed in USD = debtAmountUsd + slippage.
  // Do NOT use collateralATokenBalance (total balance) — only the amount
  // needed for this specific swap will be pulled, not the whole position.
  const hfBeforeCollateralEffect = useMemo(() => {
    if (!activeCollateral || !activeCollateralFormatted || !debtAmount || Number(debtAmount) <= 0) return undefined;
    if (valueToBigNumber(user.totalBorrowsUSD).eq(0)) return Infinity;

    // Debt amount in USD (using normalized price from ComputedReserveData)
    const debtAmountUsd = valueToBigNumber(debtAmount)
      .multipliedBy(debtReserve.priceInMarketReferenceCurrency)
      .multipliedBy(marketRefPriceInUsd);

    // Estimated collateral USD to pull = debtUsd + slippage buffer.
    // In USD terms: collateralRemovedUsd ≈ debtUsd (swap is ~1:1 in value),
    // so we only need debtUsd here to estimate the collateral withdrawal impact.
    const estimatedCollateralRemovedUsd = debtAmountUsd.multipliedBy(1 + slippageBps / 10000);

    const newCollateralUsd = valueToBigNumber(user.totalCollateralUSD).minus(estimatedCollateralRemovedUsd);

    if (newCollateralUsd.lte(0)) return 0;

    const hf = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: newCollateralUsd,
      borrowBalanceMarketReferenceCurrency: valueToBigNumber(user.totalBorrowsUSD),
      currentLiquidationThreshold: user.currentLiquidationThreshold,
    });
    return hf.toNumber();
  }, [activeCollateral, activeCollateralFormatted, debtAmount, debtReserve, slippageBps, user, marketRefPriceInUsd]);

  // ── Repay with collateral hook ───────────────────────────────────────────
  const {
    status,
    quoteError,
    collateralNeeded,
    maxCollateral,
    needsApproval,
    needsFlashLoan,
    isQuoting,
    isBusy,
    approve,
    execute,
    reset,
  } = useRepayWithCollateral({
    collateralAsset: activeCollateral?.reserve.underlyingAsset as `0x${string}` | undefined,
    collateralDecimals: activeCollateral?.reserve.decimals ?? 18,
    collateralATokenAddress: activeCollateral?.reserve.aTokenAddress as `0x${string}` | undefined,
    debtAsset: debtReserve.underlyingAsset as `0x${string}`,
    debtDecimals: debtReserve.decimals,
    userAddress,
    debtAmountHuman: debtAmount,
    isMaxDebt,
    rateMode: BigInt(2), // variable
    slippageBps,
    hfBeforeCollateralEffect,
    onSuccess: () => {
      setDebtAmount('');
      setIsMaxDebt(false);
      onSuccess?.();
    },
  });

  // ── Projected HF after the full swap+repay ───────────────────────────────
  // 1. Repaying debt → debt decreases
  // 2. Pulling collateral → collateral decreases by collateralNeeded USD
  const projectedHF = useMemo(() => {
    if (!debtAmount || Number(debtAmount) <= 0 || !activeCollateralFormatted || !collateralNeeded) return null;

    // Use NORMALIZED prices (ComputedReserveData) so units match user.totalCollateralUSD / totalBorrowsUSD
    const debtAmountUsd = valueToBigNumber(debtAmount)
      .multipliedBy(debtReserve.priceInMarketReferenceCurrency) // debtReserve is already ComputedReserveData
      .multipliedBy(marketRefPriceInUsd);

    const collateralRemovedUsd = valueToBigNumber(collateralNeeded)
      .multipliedBy(activeCollateralFormatted.priceInMarketReferenceCurrency) // normalized
      .multipliedBy(marketRefPriceInUsd);

    const newCollateralUsd = valueToBigNumber(user.totalCollateralUSD).minus(collateralRemovedUsd);
    const newBorrowsUsd = valueToBigNumber(user.totalBorrowsUSD).minus(debtAmountUsd);

    if (newBorrowsUsd.lte(0)) return '∞';
    if (newCollateralUsd.lte(0)) return '0.00';

    const finalHF = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: newCollateralUsd,
      borrowBalanceMarketReferenceCurrency: newBorrowsUsd,
      currentLiquidationThreshold: user.currentLiquidationThreshold,
    });

    return finalHF.isNegative() ? '∞' : finalHF.toFixed(2);
  }, [debtAmount, activeCollateralFormatted, collateralNeeded, debtReserve, user, marketRefPriceInUsd]);

  // ── Validation ───────────────────────────────────────────────────────────
  const blockingError = useMemo(() => {
    if (!debtAmount || Number(debtAmount) <= 0) return null;
    if (Number(debtAmount) > maxDebtToRepay)
      return `Exceeds remaining debt (${formatTokenAmount(maxDebtToRepay)} ${debtReserve.symbol})`;
    if (maxCollateral && Number(collateralATokenBalance) < Number(maxCollateral))
      return `Insufficient collateral: need ${formatTokenAmount(maxCollateral)} ${activeCollateral?.reserve.symbol ?? ''}`;
    if (quoteError) return `Quote error: ${quoteError}`;
    return null;
  }, [debtAmount, maxDebtToRepay, maxCollateral, collateralATokenBalance, activeCollateral, quoteError, debtReserve]);

  const isHFDangerous = projectedHF !== null && projectedHF !== '∞' && Number(projectedHF) < 1.05;

  const canExecute =
    !!userAddress &&
    !!debtAmount &&
    Number(debtAmount) > 0 &&
    !blockingError &&
    !isQuoting &&
    !!collateralNeeded &&
    !needsApproval &&
    status !== 'success';

  const canApprove = !!userAddress && needsApproval && !isBusy && !!collateralNeeded;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleMax = useCallback(() => {
    setDebtAmount(maxDebtToRepay.toString());
    setIsMaxDebt(true);
  }, [maxDebtToRepay]);

  // ── Guard: no collateral available ───────────────────────────────────────
  if (availableCollaterals.length === 0) {
    return (
      <Alert>
        <AlertTriangle className='size-4' />
        <AlertDescription className='text-xs'>
          No eligible collateral available. Deposit assets first to use this feature.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='flex flex-col gap-3'>
      {/* ── Collateral Selector ── */}
      <div className='flex flex-col gap-1'>
        <span className='text-muted-foreground text-xs'>Collateral to use</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type='button'
              className='flex w-full items-center justify-between rounded-xs border border-border bg-muted/30 px-3 py-2 text-sm transition-colors hover:bg-muted/50'
            >
              <span className='flex items-center gap-2'>
                {activeCollateral && <TokenIcon symbol={activeCollateral.reserve.symbol} size={18} />}
                <span className='font-medium'>{activeCollateral?.reserve.symbol ?? 'Select collateral'}</span>
                <span className='text-muted-foreground text-xs'>
                  ({formatTokenAmount(collateralATokenBalance)} deposited)
                </span>
              </span>
              <ChevronDown size={14} className='text-muted-foreground' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='min-w-[240px]'>
            {availableCollaterals.map((ur) => (
              <DropdownMenuItem
                key={ur.reserve.underlyingAsset}
                onClick={() => {
                  setSelectedCollateral(ur);
                  reset();
                  setDebtAmount('');
                }}
                className='flex items-center justify-between gap-3'
              >
                <span className='flex items-center gap-2'>
                  <TokenIcon symbol={ur.reserve.symbol} size={16} />
                  <span>{ur.reserve.symbol}</span>
                </span>
                <span className='text-muted-foreground text-xs'>
                  {formatTokenAmount(getComputedBalance(ur.reserve.underlyingAsset))} deposited
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Debt Amount Input ── */}
      <AmountInput
        value={debtAmount}
        onChange={(v) => {
          setDebtAmount(v);
          setIsMaxDebt(false);
        }}
        symbol={debtReserve.symbol}
        onMax={handleMax}
        label='Debt to repay'
        usdValue={
          debtAmount && Number(debtAmount) > 0
            ? Number(debtAmount) * Number(debtReserve.priceInMarketReferenceCurrency) * Number(marketRefPriceInUsd)
            : undefined
        }
        validate={(v) => {
          if (!v || Number(v) <= 0) return null;
          if (Number(v) > maxDebtToRepay) return 'Exceeds remaining debt';
          return null;
        }}
      />

      {/* ── Quote Result ── */}
      {debtAmount && Number(debtAmount) > 0 && (
        <div className='rounded-xs border border-border bg-muted/20 p-3'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='flex items-center gap-1.5 text-muted-foreground text-xs'>
              <RefreshCw size={11} className={isQuoting ? 'animate-spin' : ''} />
              Collateral required
            </span>
            {needsFlashLoan && (
              <span className='flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-600 dark:text-amber-400'>
                <Zap size={9} />
                Flash Loan
              </span>
            )}
          </div>

          {isQuoting ? (
            <div className='flex items-center gap-2 text-muted-foreground text-sm'>
              <Loader2 size={14} className='animate-spin' />
              Fetching V3 quote...
            </div>
          ) : quoteError ? (
            <p className='text-red-500 text-xs'>{quoteError}</p>
          ) : collateralNeeded && maxCollateral ? (
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-1.5'>
                <span className='font-semibold text-foreground text-sm'>
                  {formatTokenAmount(maxCollateral)} {activeCollateral?.reserve.symbol}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={11} className='cursor-help text-muted-foreground' />
                  </TooltipTrigger>
                  <TooltipContent side='top' className='max-w-[220px] text-xs'>
                    Exact V3 quote: {formatTokenAmount(collateralNeeded)} + {slippageBps / 100}% slippage ={' '}
                    {formatTokenAmount(maxCollateral)}
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className='text-[11px] text-muted-foreground'>
                Quoted via Uniswap V3 · {slippageBps / 100}% max slippage
                {needsFlashLoan && ' · Atomic flash loan required'}
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* ── Slippage Selector ── */}
      <div className='flex items-center gap-1.5'>
        <span className='shrink-0 text-muted-foreground text-xs'>Max slippage:</span>
        <div className='flex gap-1'>
          {SLIPPAGE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type='button'
              onClick={() => setSlippageBps(preset.value)}
              className={`rounded px-2 py-0.5 text-xs transition-colors ${
                slippageBps === preset.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Blocking Error ── */}
      {blockingError && (
        <Alert variant='destructive'>
          <AlertTriangle className='size-4' />
          <AlertDescription className='text-xs'>{blockingError}</AlertDescription>
        </Alert>
      )}

      {/* ── HF Danger Warning ── */}
      {isHFDangerous && !blockingError && (
        <Alert variant='warning'>
          <AlertTriangle className='size-4' />
          <AlertDescription className='text-xs'>
            Projected Health Factor is very low ({projectedHF}). You are close to liquidation.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Flash Loan Info ── */}
      {needsFlashLoan && (
        <Alert>
          <Zap className='size-4' />
          <AlertDescription className='text-xs'>
            A flash loan will be used to atomically repay your debt and pull collateral, preventing a dangerous Health
            Factor drop during the transaction.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Action Buttons ── */}
      <div className='flex gap-2'>
        {/* Step 1: Approve aToken → Adapter */}
        {needsApproval && (
          <Button
            variant='outline'
            className='flex-1'
            icon={
              status === 'approving' || status === 'confirming-approve' ? (
                <Loader2 size={14} className='animate-spin' />
              ) : (
                <Lock size={14} />
              )
            }
            onClick={approve}
            disabled={!canApprove || isBusy}
          >
            {status === 'approving'
              ? 'Signing...'
              : status === 'confirming-approve'
                ? 'Approving...'
                : `Approve ${activeCollateral?.reserve.symbol ?? ''}`}
          </Button>
        )}

        {/* Step 2: Execute swap + repay */}
        <Button
          className='flex-1'
          icon={
            status === 'executing' || status === 'confirming-exec' ? (
              <Loader2 size={14} className='animate-spin' />
            ) : (
              <ArrowRight size={14} />
            )
          }
          onClick={execute}
          disabled={!canExecute || isBusy}
        >
          {status === 'executing'
            ? 'Signing...'
            : status === 'confirming-exec'
              ? 'Confirming...'
              : status === 'success'
                ? 'Done!'
                : needsFlashLoan
                  ? 'Flash Repay'
                  : 'Repay with Collateral'}
        </Button>
      </div>

      {/* ── Info Summary Box ── */}
      <div className='flex flex-col gap-2 rounded-xs border border-border p-3'>
        <InfoRow label='Remaining debt' value={`${formatTokenAmount(maxDebtToRepay)} ${debtReserve.symbol}`} />
        {collateralNeeded && activeCollateral && (
          <InfoRow
            label='Collateral to swap'
            value={`≈ ${formatTokenAmount(maxCollateral ?? '0')} ${activeCollateral.reserve.symbol}`}
          />
        )}
        <InfoRow
          label='Health Factor'
          value={
            <div className='flex flex-col items-end gap-0.5'>
              <HealthFactorDisplay
                currentHf={Number(user.healthFactor).toFixed(2)}
                newHf={
                  projectedHF ??
                  (debtAmount && Number(debtAmount) > 0
                    ? computeNewHealthFactor('repay', debtAmount, debtReserve, user, marketRefPriceInUsd)
                    : '—')
                }
              />
              <span className='text-[11px] text-muted-foreground'>Liquidation at 1.0</span>
            </div>
          }
        />
        <InfoRow
          label='Swap method'
          value={
            <span className='flex items-center gap-1 text-xs'>
              {needsFlashLoan ? (
                <>
                  <Zap size={11} className='text-amber-500' />
                  Flash Loan + Uniswap V3
                </>
              ) : (
                'Direct Uniswap V3'
              )}
            </span>
          }
        />
      </div>
    </div>
  );
}
