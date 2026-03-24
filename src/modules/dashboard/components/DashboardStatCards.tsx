import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatHfValue, getHealthFactorLabel, getHfColor } from '@/lib/format-health-factor';
import { cn } from '@/lib/utils';
import { formatUsd } from '@/utils/format';

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------
function StatCard({ label, tooltip, children }: { label: string; tooltip?: string; children: React.ReactNode }) {
  return (
    <div className='flex flex-1 flex-col gap-2 rounded-xs border border-border bg-card p-5'>
      <span className='flex items-center gap-1 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
        {label}
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='cursor-help'>
                <Info size={12} />
              </span>
            </TooltipTrigger>
            <TooltipContent side='top' className='max-w-[240px] text-xs'>
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </span>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// HealthFactorBar
// ---------------------------------------------------------------------------
function HealthFactorBar({ value }: { value: number }) {
  // No borrows (-1) → full bar; otherwise piecewise: HF 0→0%, HF 1→75% (green zone), HF 3+→100%
  const pct = value < 0 ? 100 : value <= 1 ? Math.min(value * 75, 75) : Math.min(75 + ((value - 1) / 2) * 25, 100);

  return (
    <div className='mt-1 h-2 w-full overflow-hidden rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500'>
      <div
        className='h-full rounded-r-full bg-muted transition-all duration-500'
        style={{ width: `${100 - pct}%`, marginLeft: 'auto' }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// LtvBar
// ---------------------------------------------------------------------------
function LtvBar({ value }: { value: number }) {
  return (
    <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
      <div
        className='h-full rounded-full bg-primary transition-all duration-500'
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// DashboardStatCards
// ---------------------------------------------------------------------------
interface DashboardStatCardsProps {
  netWorth: number;
  netApy: string | null;
  healthFactor: number;
  ltv: number;
  totalBorrowUsd: number;
}

export function DashboardStatCards({ netWorth, netApy, healthFactor, ltv, totalBorrowUsd }: DashboardStatCardsProps) {
  const t = useTranslations('modules.market.Dashboard');

  const hfDisplay = formatHfValue(healthFactor);
  const hfMeta = getHealthFactorLabel(healthFactor);
  const hfColor = getHfColor(hfDisplay);

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
      <StatCard label={t('netWorth')} tooltip={t('netWorthTooltip')}>
        <span className='font-bold text-3xl text-foreground'>{formatUsd(netWorth)}</span>
      </StatCard>

      <StatCard label={t('netApy')} tooltip={t('netApyTooltip')}>
        <span
          className={cn(
            'font-bold text-3xl',
            netApy && !netApy.startsWith('>-') && !netApy.startsWith('-') ? 'text-success' : 'text-foreground'
          )}
        >
          {netApy ?? '—'}
        </span>
      </StatCard>

      <StatCard label={t('healthFactor')} tooltip={t('healthFactorTooltip')}>
        <div className='flex items-baseline gap-2'>
          <span className={cn('font-bold text-3xl', hfColor)}>{hfDisplay}</span>
          <span className={cn('rounded-md px-2 py-0.5 font-semibold text-[10px] uppercase', hfMeta.color)}>
            {hfMeta.label}
          </span>
        </div>
        {healthFactor > 0 && Number.isFinite(healthFactor) && <HealthFactorBar value={healthFactor} />}
      </StatCard>

      <StatCard label={t('currentLtv')} tooltip={t('currentLtvTooltip')}>
        <span className='font-bold text-3xl text-foreground'>{totalBorrowUsd > 0 ? `${ltv.toFixed(0)}%` : '0%'}</span>
        <LtvBar value={ltv} />
      </StatCard>
    </div>
  );
}
