import { cn } from '@/lib/utils';

interface ProposalVotingBarProps {
  yesPercent: number;
  noPercent: number;
  yesLabel?: string;
  noLabel?: string;
  className?: string;
  labelClassName?: string;
  barClassName?: string;
}

export function ProposalVotingBar({
  yesPercent,
  noPercent,
  yesLabel,
  noLabel,
  className,
  labelClassName,
  barClassName,
}: ProposalVotingBarProps) {
  const yesWidth = clampPercent(yesPercent);
  const noWidth = clampPercent(noPercent);
  const resolvedYesLabel = yesLabel ?? 'Yea';
  const resolvedNoLabel = noLabel ?? 'Nay';

  return (
    <div className={cn('space-y-3', className)}>
      <div
        className={cn(
          'flex items-center justify-between gap-4 font-mono font-semibold text-sm uppercase tracking-[0.08em]',
          labelClassName
        )}
      >
        <span className='text-success'>{`${resolvedYesLabel} ${yesPercent.toFixed(1)}%`}</span>
        <span className='text-destructive'>{`${resolvedNoLabel} ${noPercent.toFixed(1)}%`}</span>
      </div>

      <div className={cn('flex h-6 overflow-hidden rounded-xs bg-secondary', barClassName)}>
        <div className='h-full bg-success' style={{ width: `${yesWidth}%` }} />
        <div className='h-full bg-destructive' style={{ width: `${noWidth}%` }} />
      </div>
    </div>
  );
}

function clampPercent(percent: number) {
  return Math.min(100, Math.max(0, percent));
}
