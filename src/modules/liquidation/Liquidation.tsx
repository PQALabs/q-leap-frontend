'use client';

import { ArrowUpDown } from 'lucide-react';
import { useLiquidationPositions } from '@/api/liquidation/queries';
import type { ILiquidationPosition } from '@/api/liquidation/types';
import { env } from '@/config/env';
import { LiquidationTable } from './components/LiquidationTable';

export function Liquidation() {
  const { data, isLoading, isError, refetch } = useLiquidationPositions();
  console.log('🚀 ~ Liquidation ~ data:', env.API_URL);
  console.log('🚀 ~ Liquidation ~ process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

  const positions: ILiquidationPosition[] = data?.data ?? [];

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='font-bold text-2xl text-foreground'>Liquidation Queue</h1>
          <p className='mt-1 text-muted-foreground text-sm'>
            Positions eligible for liquidation, sorted by health factor
          </p>
        </div>

        <div className='flex items-center gap-2 text-muted-foreground text-xs'>
          <ArrowUpDown size={13} />
          <span>Sorted by Health Factor Ascending</span>
        </div>
      </div>

      {/* Table card */}
      <div className='rounded-xs border border-border bg-card shadow-xs'>
        <LiquidationTable positions={positions} isLoading={isLoading} isError={isError} onRetry={() => refetch()} />
      </div>

      {/* Footer stats */}
      {!isLoading && !isError && positions.length > 0 && (
        <p className='text-center text-muted-foreground text-xs'>
          {positions.length} position{positions.length !== 1 ? 's' : ''} eligible for liquidation
        </p>
      )}
    </div>
  );
}
