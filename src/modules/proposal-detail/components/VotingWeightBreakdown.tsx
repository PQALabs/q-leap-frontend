import { cn } from '@/lib/utils';
import type { VotingWeightInfo } from '../proposal-voting';

interface VotingWeightBreakdownProps {
  weightInfo: VotingWeightInfo;
}

/**
 * Renders a breakdown of voting weight using the veToken model:
 * Token Balance × (lockDays / maxDays) = Voting Weight
 */
export function VotingWeightBreakdown({ weightInfo }: VotingWeightBreakdownProps) {
  const percentLabel = (weightInfo.percentOfMax * 100).toFixed(0);

  return (
    <div className='space-y-3'>
      {/* Token Balance */}
      <div className='flex items-center justify-between'>
        <span className='text-muted-foreground text-sm'>Token Balance</span>
        <span className='font-mono text-foreground text-sm'>
          {Number(weightInfo.tokenBalance).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          <span className='text-muted-foreground'>AAVE</span>
        </span>
      </div>

      {/* Lock Duration */}
      <div className='flex items-center justify-between'>
        <span className='text-muted-foreground text-sm'>Lock Duration</span>
        <div className='text-right'>
          <span className='font-mono text-foreground text-sm'>{weightInfo.lockDurationLabel}</span>
          <p className='text-muted-foreground text-xs'>
            {weightInfo.lockDurationDays} / {weightInfo.maxLockDays} days
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className='space-y-1'>
        <div className='relative h-2 w-full overflow-hidden rounded-full bg-muted'>
          <div
            className='h-full rounded-full bg-primary transition-all duration-300'
            style={{ width: `${weightInfo.percentOfMax * 100}%` }}
          />
        </div>
        <div className='flex justify-between'>
          <span className='text-muted-foreground text-xs'>0</span>
          <span className='text-muted-foreground text-xs'>{percentLabel}% of max</span>
          <span className='text-muted-foreground text-xs'>{weightInfo.maxLockDays}d</span>
        </div>
      </div>

      {/* Multiplier */}
      <div className='flex items-center justify-between'>
        <span className='text-muted-foreground text-sm'>Multiplier</span>
        <span
          className={cn(
            'font-mono font-semibold text-sm',
            weightInfo.multiplier >= 0.5 ? 'text-success' : 'text-warning-foreground'
          )}
        >
          {weightInfo.multiplier.toFixed(2)}×
        </span>
      </div>

      {/* Divider */}
      <div className='border-border border-t' />

      {/* Voting Weight Total */}
      <div className='flex items-center justify-between'>
        <span className='font-semibold text-foreground text-sm'>Voting Weight</span>
        <span className='font-bold font-mono text-foreground text-lg'>
          {Number(weightInfo.votingWeight).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
    </div>
  );
}
