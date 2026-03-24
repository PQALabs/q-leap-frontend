'use client';

import { ArrowDownToLine, CircleMinus, CirclePlus, Lock } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { computeNewHealthFactor } from '@/lib/compute-health-factor';
import type { ComputedReserveData, UserSummary } from '@/stores/use-pool-data-store';
import { AmountInput } from './AmountInput';
import { HealthFactorDisplay, InfoRow } from './ReserveActionHelpers';

interface BorrowRepayPanelProps {
  reserve: ComputedReserveData;
  user: UserSummary | undefined;
  marketRefPriceInUsd: string;
}

export function BorrowRepayPanel({ reserve, user, marketRefPriceInUsd }: BorrowRepayPanelProps) {
  const [borrowAmount, setBorrowAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');

  const variableBorrowApy = (Number(reserve.variableBorrowAPY) * 100).toFixed(2);

  const userReserve = user?.userReservesData.find(
    (ur) => ur.reserve.underlyingAsset.toLowerCase() === reserve.underlyingAsset.toLowerCase()
  );
  const borrowedBalance = userReserve ? Number(userReserve.totalBorrows) : 0;

  return (
    <div className='flex flex-col gap-5'>
      {/* ── Borrow section ── */}
      <div className='flex flex-col gap-3'>
        <div className='flex items-center justify-between'>
          <h3 className='flex items-center gap-2 font-semibold text-foreground'>
            <CirclePlus size={18} className='text-primary' />
            Borrow {reserve.symbol}
          </h3>
          <span className='text-muted-foreground text-xs'>
            Available: {Number(reserve.availableLiquidity).toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
            {reserve.symbol}
          </span>
        </div>

        <AmountInput
          value={borrowAmount}
          onChange={setBorrowAmount}
          symbol={reserve.symbol}
          onMax={() => setBorrowAmount(reserve.availableLiquidity.toString())}
          maxAmount={reserve.availableLiquidity.toString()}
          errorMessage='Exceeds available liquidity'
          label='Amount'
        />

        <Button className='w-full' icon={<ArrowDownToLine size={14} />}>
          Borrow
        </Button>

        <div className='flex flex-col gap-2 rounded-xs border border-border p-3'>
          <InfoRow label='Borrow APY (Variable)' value={`${variableBorrowApy}%`} valueColor='text-red-500' />
          <InfoRow
            label='Health Factor'
            value={
              user ? (
                <HealthFactorDisplay
                  currentHf={Number(user.healthFactor).toFixed(2)}
                  newHf={computeNewHealthFactor('borrow', borrowAmount, reserve, user, marketRefPriceInUsd)}
                />
              ) : (
                '—'
              )
            }
          />
        </div>
      </div>

      <Separator />

      {/* ── Repay section ── */}
      <div className='flex flex-col gap-3'>
        <div className='flex items-center justify-between'>
          <h3 className='flex items-center gap-2 font-semibold text-foreground'>
            <CircleMinus size={18} className='text-emerald-600' />
            Repay {reserve.symbol}
          </h3>
          <span className='text-muted-foreground text-xs'>
            Debt: {borrowedBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} {reserve.symbol}
          </span>
        </div>

        <AmountInput
          value={repayAmount}
          onChange={setRepayAmount}
          symbol={reserve.symbol}
          onMax={() => setRepayAmount(borrowedBalance.toString())}
          maxAmount={borrowedBalance.toString()}
          errorMessage='Exceeds outstanding debt'
          label='Repay Amount'
        />

        <div className='flex gap-3'>
          <Button variant='outline' className='flex-1' icon={<Lock size={14} />}>
            Approve
          </Button>
          <Button className='flex-1' icon={<ArrowDownToLine size={14} />}>
            Repay
          </Button>
        </div>

        <div className='flex flex-col gap-2 rounded-xs border border-border p-3'>
          <InfoRow
            label='Remaining Debt'
            value={`${borrowedBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${reserve.symbol}`}
          />
          <InfoRow
            label='New Health Factor'
            value={
              user ? (
                <HealthFactorDisplay
                  currentHf={Number(user.healthFactor).toFixed(2)}
                  newHf={computeNewHealthFactor('repay', repayAmount, reserve, user, marketRefPriceInUsd)}
                />
              ) : (
                '—'
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
