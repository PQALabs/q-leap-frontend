'use client';

import { useEffect, useRef } from 'react';

/** Add thousand separators to a numeric string (keeps decimals intact) */
function formatWithCommas(v: string): string {
  if (!v) return v;
  const [int, dec] = v.split('.');
  const formatted = int!.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return dec !== undefined ? `${formatted}.${dec}` : formatted;
}

/** Strip commas from a formatted string */
function stripCommas(v: string): string {
  return v.replace(/,/g, '');
}

interface AmountInputProps {
  value: string;
  onChange: (v: string) => void;
  symbol: string;
  onMax?: () => void;
  label: string;
  maxAmount?: string;
  errorMessage?: string;
  /** When true, suppress the "exceeds max" validation (user explicitly selected MAX) */
  isMaxSelected?: boolean;
  /** Optional USD equivalent to display below the amount */
  usdValue?: number;
}

export function AmountInput({
  value,
  onChange,
  symbol,
  onMax,
  label,
  maxAmount,
  errorMessage = 'Amount exceeds limit',
  isMaxSelected = false,
  usdValue,
}: AmountInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<number | null>(null);
  const exceedsMax = !isMaxSelected && maxAmount !== undefined && value !== '' && Number(value) > Number(maxAmount);

  const displayValue = formatWithCommas(value);

  // Restore cursor position after React re-renders with formatted value
  useEffect(() => {
    if (cursorRef.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorRef.current, cursorRef.current);
      cursorRef.current = null;
    }
  }, [displayValue]);

  return (
    <div
      className={`rounded-xs border p-3 ${exceedsMax ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20' : 'border-border bg-muted/30'}`}
    >
      <div className='mb-1 flex items-center justify-between'>
        <span className='font-semibold text-muted-foreground text-xs uppercase tracking-wider'>{label}</span>
        {onMax && (
          <button
            type='button'
            onClick={onMax}
            className='cursor-pointer font-semibold text-primary text-xs hover:underline'
          >
            MAX
          </button>
        )}
      </div>
      <div className='flex items-center gap-2 overflow-hidden'>
        <input
          ref={inputRef}
          type='text'
          inputMode='decimal'
          value={displayValue}
          onKeyDown={(e) => {
            if (e.key === 'e' || e.key === 'E') e.preventDefault();
          }}
          onChange={(e) => {
            const cursorPos = e.target.selectionStart ?? 0;
            const oldFormatted = e.target.value;
            const raw = stripCommas(oldFormatted);
            // Allow empty, or valid decimal number with up to 6 decimal places
            if (raw === '' || /^\d*\.?\d{0,4}$/.test(raw)) {
              // Calculate cursor offset from commas before cursor in old vs new formatted
              const commasBefore = (oldFormatted.slice(0, cursorPos).match(/,/g) || []).length;
              const newFormatted = formatWithCommas(raw);
              const newCommasBefore = (newFormatted.slice(0, cursorPos).match(/,/g) || []).length;
              cursorRef.current = cursorPos + (newCommasBefore - commasBefore);
              onChange(raw);
            }
          }}
          placeholder='0.00'
          className='min-w-0 flex-1 bg-transparent font-bold text-2xl text-foreground outline-none placeholder:text-muted-foreground/40'
        />
        <span className='shrink-0 font-medium text-muted-foreground text-sm'>{symbol}</span>
      </div>
      {usdValue != null && usdValue > 0 && (
        <p className='mt-1 text-[11px] text-muted-foreground/70'>
          ≈ $ {usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      )}
      {exceedsMax && <p className='mt-1 font-medium text-red-500 text-xs'>{errorMessage}</p>}
    </div>
  );
}
