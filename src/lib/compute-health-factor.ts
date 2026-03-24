import { calculateHealthFactorFromBalancesBigUnits, valueToBigNumber } from '@/math-utils';
import type { ComputedReserveData, UserSummary } from '@/stores/use-pool-data-store';

/**
 * Computes the projected health factor after an amount change.
 * @param mode - 'supply' | 'withdraw' | 'borrow' | 'repay'
 * @param amount - the amount being supplied/withdrawn/borrowed/repaid (human-readable)
 * @param reserve - the reserve data (for price + decimals)
 * @param user - the user's current position
 * @param marketRefPriceInUsd - market reference currency price in USD
 */
export function computeNewHealthFactor(
  mode: 'supply' | 'withdraw' | 'borrow' | 'repay',
  amount: string,
  reserve: ComputedReserveData,
  user: UserSummary,
  marketRefPriceInUsd: string
): string {
  const amountBN = valueToBigNumber(amount || '0');
  if (amountBN.lte(0)) return Number(user.healthFactor).toFixed(2);

  const amountInUsd = amountBN.multipliedBy(reserve.priceInMarketReferenceCurrency).multipliedBy(marketRefPriceInUsd);

  let newCollateral = valueToBigNumber(user.totalCollateralUSD);
  let newBorrows = valueToBigNumber(user.totalBorrowsUSD);

  switch (mode) {
    case 'supply':
      if (reserve.usageAsCollateralEnabled) {
        newCollateral = newCollateral.plus(amountInUsd);
      }
      break;
    case 'withdraw':
      if (reserve.usageAsCollateralEnabled) {
        newCollateral = newCollateral.minus(amountInUsd);
        if (newCollateral.lt(0)) newCollateral = valueToBigNumber('0');
      }
      break;
    case 'borrow':
      newBorrows = newBorrows.plus(amountInUsd);
      break;
    case 'repay':
      newBorrows = newBorrows.minus(amountInUsd);
      if (newBorrows.lt(0)) newBorrows = valueToBigNumber('0');
      break;
  }

  if (newBorrows.eq(0)) return '∞';

  const newHF = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: newCollateral,
    borrowBalanceMarketReferenceCurrency: newBorrows,
    currentLiquidationThreshold: user.currentLiquidationThreshold,
  });

  return newHF.isNegative() ? '∞' : newHF.toFixed(2);
}
