import { BigNumber } from 'bignumber.js';
import { MAX_INPUT_DECIMALS } from '@/utils/format';

export type BigNumberValue = string | number | BigNumber;

export const BigNumberZeroDecimal = BigNumber.clone({
  DECIMAL_PLACES: 0,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
});

export function valueToBigNumber(amount: BigNumberValue): BigNumber {
  if (amount instanceof BigNumber) {
    return amount;
  }

  return new BigNumber(amount);
}

export function valueToZDBigNumber(amount: BigNumberValue): BigNumber {
  return new BigNumberZeroDecimal(amount);
}

export function normalize(n: BigNumberValue, decimals: number): string {
  return normalizeBN(n, decimals).toString(10);
}

export function normalizeBN(n: BigNumberValue, decimals: number): BigNumber {
  return valueToBigNumber(n).shiftedBy(decimals * -1);
}

/**
 * Truncates a numeric value to `decimals` decimal places using ROUND_DOWN,
 * never rounding up. Use in all MAX-button handlers before calling setAmount().
 *
 * Examples:
 *   truncateInputAmount(1.9999999) → "1.999999"  (not "2.000000")
 *   truncateInputAmount("2.601398473629") → "2.601398"
 *   truncateInputAmount(0.000000000000000011) → "0"
 */
export function truncateInputAmount(value: BigNumberValue, decimals = MAX_INPUT_DECIMALS): string {
  // BigNumber.ROUND_DOWN = 1 — strict truncation, never rounds up
  return valueToBigNumber(value).decimalPlaces(decimals, 1).toString(10);
}
