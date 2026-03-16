import type { CustomFormatConfig, FormatNumberOptions } from 'react-intl';
import { valueToBigNumber } from '@/math-utils';

interface CompactNumberProps {
  value: string | number;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
}

const POSTFIXES = ['', 'K', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y'];

export function CompactNumber({
  value,
  maximumFractionDigits = 2,
  minimumFractionDigits = 2,
}: CompactNumberProps & FormatNumberOptions & CustomFormatConfig) {
  const bnValue = valueToBigNumber(value);

  const integerPlaces = bnValue.toFixed(0).length;
  const significantDigitsGroup = Math.min(
    Math.floor(integerPlaces ? (integerPlaces - 1) / 3 : 0),
    POSTFIXES.length - 1
  );
  const postfix = POSTFIXES[significantDigitsGroup];
  const formattedValue = bnValue.dividedBy(10 ** (3 * significantDigitsGroup)).toNumber();

  const formatted = new Intl.NumberFormat(undefined, {
    maximumFractionDigits,
    minimumFractionDigits,
  }).format(formattedValue);

  return (
    <>
      {formatted}
      {postfix}
    </>
  );
}
