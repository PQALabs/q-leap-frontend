'use client';

import { Info, TrendingDown, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UsdValue } from '@/components/usd-value';

// Tooltip descriptions are now provided via translations (market.tooltipTotalMarketSize, etc.)

// ---------------------------------------------------------------------------
// MetricTooltip helper – renders the Info icon with a Radix tooltip
// ---------------------------------------------------------------------------
function MetricTooltip({ content }: { content: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className='inline-flex cursor-help'>
            <Info size={12} className='text-muted-foreground/60' />
          </span>
        </TooltipTrigger>
        <TooltipContent side='top' className='max-w-[260px] text-center text-xs leading-relaxed'>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ---------------------------------------------------------------------------
// SummaryCard
// ---------------------------------------------------------------------------
interface SummaryCardProps {
  label: string;
  value: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  progress?: number; // 0–100 for utilization bar
  tooltip?: string;
}

function SummaryCard({ label, value, change, changeType, progress, tooltip }: SummaryCardProps) {
  return (
    <div className='flex flex-1 flex-col gap-3 rounded-xs border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm'>
      {/* Label */}
      <div className='flex items-center gap-1.5 font-semibold text-muted-foreground text-xs uppercase tracking-widest'>
        {label}
        {tooltip && <MetricTooltip content={tooltip} />}
      </div>

      {/* Value */}
      <div className='font-bold text-2xl text-foreground leading-tight'>{value}</div>

      {/* Change badge */}
      {change && (
        <div
          className={`flex w-fit items-center gap-1 rounded-full px-2 py-0.5 font-semibold text-xs ${
            changeType === 'positive'
              ? 'bg-success/10 text-success'
              : changeType === 'negative'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-muted text-muted-foreground'
          }`}
        >
          {changeType === 'positive' && <TrendingUp size={11} />}
          {changeType === 'negative' && <TrendingDown size={11} />}
          {change}
        </div>
      )}

      {/* Progress bar (for utilization rate) */}
      {progress !== undefined && (
        <div className='h-2 w-full overflow-hidden rounded-full bg-secondary'>
          <div
            className='h-full rounded-full bg-primary transition-all duration-500'
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ApyCard
// ---------------------------------------------------------------------------
function ApyCard({ label, value, tooltip }: { label: string; value: string; tooltip?: string }) {
  return (
    <div className='flex flex-1 flex-col gap-3 rounded-xs border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm'>
      <div className='flex items-center gap-1.5 font-semibold text-muted-foreground text-xs uppercase tracking-widest'>
        {label}
        {tooltip && <MetricTooltip content={tooltip} />}
      </div>
      <div className='font-bold text-2xl text-success leading-tight'>{value}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MarketSummary (public export)
// ---------------------------------------------------------------------------
interface MarketSummaryProps {
  totalMarketSize: number;
  totalMarketSizeChange?: string;
  totalAvailable: number;
  totalAvailableChange?: string;
  currentApy: string;
  utilizationRate: number; // percent 0-100
  utilizationRateLabel: string;
}

export function MarketSummary({
  totalMarketSize,
  totalMarketSizeChange,
  totalAvailable,
  totalAvailableChange,
  currentApy,
  utilizationRate,
  utilizationRateLabel,
}: MarketSummaryProps) {
  const t = useTranslations('modules.market.MarketSummary');

  return (
    <div className='flex flex-col gap-3 sm:flex-row'>
      <SummaryCard
        label={t('totalMarketSize')}
        value={<UsdValue value={totalMarketSize} />}
        change={totalMarketSizeChange}
        changeType='positive'
        tooltip={t('tooltipTotalMarketSize')}
      />
      <SummaryCard
        label={t('totalAvailable')}
        value={<UsdValue value={totalAvailable} />}
        change={totalAvailableChange}
        changeType='negative'
        tooltip={t('tooltipTotalAvailable')}
      />
      <ApyCard label={t('currentApy')} value={currentApy} tooltip={t('tooltipCurrentApy')} />
      <SummaryCard
        label={t('utilizationRate')}
        value={utilizationRateLabel}
        progress={utilizationRate}
        tooltip={t('tooltipUtilizationRate')}
      />
    </div>
  );
}
