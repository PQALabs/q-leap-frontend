import { cn } from '@/lib/utils';
import type { ProposalVoteResult } from '../proposal-detail.data';
import { ProposalDetailSidebarCard } from './ProposalDetailSidebarCard';

interface VotingResultsCardProps {
  yes: ProposalVoteResult;
  no: ProposalVoteResult;
}

export function VotingResultsCard({ yes, no }: VotingResultsCardProps) {
  return (
    <ProposalDetailSidebarCard title='Voting Results'>
      <div className='space-y-6'>
        <ResultRow label={yes.label} value={yes.value} percent={yes.percent} tone='yes' />
        <ResultRow label={no.label} value={no.value} percent={no.percent} tone='no' />
      </div>
    </ProposalDetailSidebarCard>
  );
}

function ResultRow({
  label,
  value,
  percent,
  tone,
}: {
  label: string;
  value: string;
  percent: number;
  tone: 'yes' | 'no';
}) {
  return (
    <div className='space-y-3'>
      <div className='flex items-baseline justify-between gap-3'>
        <span className='font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.2em]'>{label}</span>
        <div className='flex items-baseline gap-3'>
          <span className='font-mono text-2xl text-foreground'>{value}</span>
          <span className={cn('font-semibold text-lg', tone === 'yes' ? 'text-success' : 'text-destructive')}>
            {percent.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className='h-2 overflow-hidden rounded-full border border-border bg-muted'>
        <div
          className={cn('h-full rounded-full', tone === 'yes' ? 'bg-success' : 'bg-destructive')}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
