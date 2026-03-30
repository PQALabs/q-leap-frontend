'use client';

import { Check, CircleHelp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CompactNumber } from '@/components/compact-number';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ComputedReserveData } from '@/stores/use-pool-data-store';

// ---------------------------------------------------------------------------
// Helper: Info icon with tooltip
// ---------------------------------------------------------------------------
function InfoTooltip({ label }: { label: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <CircleHelp size={14} width={14} className='min-h-3.5 min-w-3.5 cursor-help text-muted-foreground' />
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ---------------------------------------------------------------------------
// Stat card — small box with label + value (used for Max LTV, etc.)
// ---------------------------------------------------------------------------
function StatBox({ label, value, tooltip }: { label: string; value: React.ReactNode; tooltip?: string }) {
  return (
    <div className='flex flex-1 flex-col gap-1 rounded-xs border border-border p-3'>
      <span className='flex items-center gap-1 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
        {label}
        {tooltip && <InfoTooltip label={tooltip} />}
      </span>
      <span className='font-bold text-foreground text-xl'>{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface ReserveStatusConfigProps {
  reserve: ComputedReserveData;
  totalSuppliedUsd: number;
  totalBorrowedUsd: number;
}

export function ReserveStatusConfig({ reserve, totalSuppliedUsd, totalBorrowedUsd }: ReserveStatusConfigProps) {
  const t = useTranslations('modules.market.ReserveOverview');

  const supplyApy = Number(reserve.supplyAPY) * 100;
  const variableBorrowApy = Number(reserve.variableBorrowAPY) * 100;

  const maxLtv = Number(reserve.baseLTVasCollateral) * 100;
  const liquidationThreshold = Number(reserve.reserveLiquidationThreshold) * 100;
  const liquidationPenalty = Number(reserve.reserveLiquidationBonus) * 100;

  const totalLiquidity = Number(reserve.totalLiquidity);
  const totalDebt = Number(reserve.totalDebt);

  return (
    <div className='flex flex-col gap-6 rounded-xs border border-border bg-card p-6'>
      {/* ── Title ── */}
      <h2 className='font-bold text-lg'>{t('reserveStatus')}</h2>

      {/* ── Supply Info ── */}
      <div className='flex flex-col gap-3'>
        <h3 className='font-bold text-muted-foreground text-xs uppercase tracking-wider'>{t('supplyInfo')}</h3>

        <div className='flex flex-wrap items-start divide-x divide-border'>
          {/* Total supplied */}
          <div className='flex flex-1 flex-col gap-1 pr-8'>
            <span className='font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
              {t('totalSupplied')}
            </span>
            <span className='font-bold text-2xl text-foreground'>
              <CompactNumber value={totalLiquidity} />
            </span>
            <span className='text-muted-foreground text-xs'>
              $ <CompactNumber value={totalSuppliedUsd} />
            </span>
          </div>

          {/* APY */}
          <div className='flex flex-1 flex-col gap-1 pl-8'>
            <span className='font-semibold text-muted-foreground text-xs uppercase tracking-wider'>{t('apy')}</span>
            <span className='font-bold text-2xl text-foreground'>
              {supplyApy < 0.01 && supplyApy > 0 ? '< 0.01' : supplyApy.toFixed(2)}{' '}
              <span className='font-normal text-base'>%</span>
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* ── Collateral Usage ── */}
      <div className='flex flex-col gap-3'>
        <div className='flex items-center gap-2'>
          <h3 className='font-bold text-muted-foreground text-xs uppercase tracking-wider'>{t('collateralUsage')}</h3>
          {reserve.usageAsCollateralEnabled && (
            <span className='inline-flex items-center gap-1 font-medium text-emerald-600 text-xs'>
              <Check size={14} /> {t('canBeCollateral')}
            </span>
          )}
        </div>

        <div className='flex flex-wrap gap-3'>
          <StatBox label={t('maxLtv')} value={`${maxLtv.toFixed(2)} %`} tooltip={t('tooltipMaxLtv')} />
          <StatBox
            label={t('liquidationThreshold')}
            value={`${liquidationThreshold.toFixed(2)} %`}
            tooltip={t('tooltipLiquidationThreshold')}
          />
          <StatBox
            label={t('liquidationPenalty')}
            value={`${liquidationPenalty.toFixed(2)} %`}
            tooltip={t('tooltipLiquidationPenalty')}
          />
        </div>
      </div>

      <Separator />

      {/* ── Borrow Info ── */}
      <div className='flex flex-col gap-3'>
        <h3 className='font-bold text-muted-foreground text-xs uppercase tracking-wider'>{t('borrowInfo')}</h3>

        <div className='flex flex-wrap items-start divide-x divide-border'>
          <div className='flex flex-1 flex-col gap-1 pr-8'>
            <span className='flex items-center gap-1 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
              {t('totalBorrowed')}
            </span>
            <span className='font-bold text-2xl text-foreground'>
              <CompactNumber value={totalDebt} />
            </span>
            <span className='text-muted-foreground text-xs'>
              $ <CompactNumber value={totalBorrowedUsd} />
            </span>
          </div>

          <div className='flex flex-1 flex-col gap-1 pl-8'>
            <span className='flex items-center gap-1 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
              {t('apyVariable')}
              <InfoTooltip label={t('tooltipApyVariable')} />
            </span>
            <span className='font-bold text-2xl text-foreground'>
              {variableBorrowApy.toFixed(2)} <span className='font-normal text-base'>%</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
