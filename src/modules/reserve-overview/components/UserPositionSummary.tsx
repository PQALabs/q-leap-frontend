'use client';

import { Info, Landmark, LayoutGrid, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { HealthBar } from '@/components/health-bar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatHfValue, getHealthFactorLabel, getHfColor } from '@/lib/format-health-factor';
import { valueToBigNumber } from '@/math-utils';
import type { ComputedReserveData, UserSummary } from '@/stores/use-pool-data-store';
import { formatUsd } from '@/utils/format';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface UserPositionSummaryProps {
  reserve: ComputedReserveData;
  user: UserSummary | undefined;
  isConnected: boolean;
}

export function UserPositionSummary({ reserve, user, isConnected }: UserPositionSummaryProps) {
  const t = useTranslations('modules.market.ReserveOverview');

  // Find user reserve data for this asset
  const userReserve = user?.userReservesData.find(
    (ur) => ur.reserve.underlyingAsset.toLowerCase() === reserve.underlyingAsset.toLowerCase()
  );

  const hasPosition =
    userReserve &&
    (valueToBigNumber(userReserve.underlyingBalanceUSD).gt(0) || valueToBigNumber(userReserve.totalBorrowsUSD).gt(0));

  if (!isConnected) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 rounded-xs border border-border bg-card p-8'>
        <ShieldCheck className='size-8 text-muted-foreground' />
        <p className='text-muted-foreground text-sm'>{t('connectWalletToSee')}</p>
      </div>
    );
  }

  if (!hasPosition) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 rounded-xs border border-border bg-card p-8'>
        <LayoutGrid className='size-8 text-muted-foreground' />
        <p className='text-muted-foreground text-sm'>{t('noPosition')}</p>
      </div>
    );
  }

  const suppliedUsd = Number(userReserve.underlyingBalanceUSD);
  const borrowedUsd = Number(userReserve.totalBorrowsUSD);
  const healthFactor = user ? Number(user.healthFactor) : 0;
  const healthFactorDisplay = formatHfValue(healthFactor);
  const hfMeta = getHealthFactorLabel(healthFactor, t);

  const utilization = suppliedUsd > 0 ? ((borrowedUsd / suppliedUsd) * 100).toFixed(1) : '0.0';

  return (
    <div className='flex flex-col gap-4 rounded-xs border border-border bg-card p-6'>
      <h2 className='font-bold text-lg'>{t('userPositionSummary')}</h2>

      <div className='flex flex-wrap divide-x divide-border'>
        {/* Supplied */}
        <div className='flex min-w-[140px] flex-1 flex-col gap-1 px-4 first:pl-0 last:pr-0'>
          <span className='flex items-center gap-1 font-bold text-muted-foreground text-xs uppercase tracking-wider'>
            <Landmark size={14} /> {t('suppliedAmount')}
          </span>
          <span className='font-bold text-2xl text-foreground'>{formatUsd(suppliedUsd)}</span>
        </div>

        {/* Borrowed */}
        <div className='flex min-w-[140px] flex-1 flex-col gap-1 px-4 first:pl-0 last:pr-0'>
          <span className='flex items-center gap-1 font-bold text-muted-foreground text-xs uppercase tracking-wider'>
            <LayoutGrid size={14} /> {t('borrowedAmount')}
          </span>
          <span className='font-bold text-2xl text-foreground'>{formatUsd(borrowedUsd)}</span>
          <span className='flex items-center gap-1 text-muted-foreground text-xs'>
            <Info size={12} className='inline' /> {t('utilization')}: {utilization}%
          </span>
        </div>

        {/* Health Factor */}
        <div className='flex min-w-[140px] flex-1 flex-col gap-1 px-4 first:pl-0 last:pr-0'>
          <span className='flex items-center gap-1 font-bold text-muted-foreground text-xs uppercase tracking-wider'>
            {t('healthFactor')}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className='cursor-help text-muted-foreground'>
                    <Info size={12} className='inline' />
                  </span>
                </TooltipTrigger>
                <TooltipContent className='max-w-xs'>{t('tooltipHealthFactor')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
          <div className='flex items-center gap-2'>
            <span className={`font-bold text-2xl ${getHfColor(healthFactorDisplay)}`}>{healthFactorDisplay}</span>
            <span className={`rounded px-1.5 py-0.5 font-bold text-[10px] uppercase ${hfMeta.color}`}>
              {hfMeta.label}
            </span>
          </div>
          <HealthBar value={healthFactor} />
        </div>
      </div>
    </div>
  );
}
