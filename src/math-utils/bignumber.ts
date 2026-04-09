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
 * When `tokenDecimals` is provided and the standard truncation (to `decimals`)
 * would produce "0" for a non-zero value (dust), the function auto-expands to
 * `tokenDecimals` so the user can still see and interact with the dust amount.
 *
 * Examples:
 *   truncateInputAmount(1.9999999)                      → "1.999999"
 *   truncateInputAmount("2.601398473629")               → "2.601398"
 *   truncateInputAmount(0.0000001, 6)                   → "0"        (no tokenDecimals)
 *   truncateInputAmount(0.0000001, 6, 18)               → "0.0000001" (dust auto-expand)
 */
export function truncateInputAmount(
  value: BigNumberValue,
  decimals = MAX_INPUT_DECIMALS,
  tokenDecimals?: number
): string {
  const bn = valueToBigNumber(value);
  const truncated = bn.decimalPlaces(decimals, 1);

  // Auto-expand for dust: if truncation yields 0 but original value > 0,
  // use the token's native decimals so the user can interact with the dust.
  if (truncated.isZero() && bn.gt(0) && tokenDecimals != null && tokenDecimals > decimals) {
    return bn.decimalPlaces(tokenDecimals, 1).toString(10);
  }

  return truncated.toString(10);
}
