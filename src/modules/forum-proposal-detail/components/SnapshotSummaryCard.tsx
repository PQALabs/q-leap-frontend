import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { SNAPSHOT_VOTES } from '../constants';
import type { ProposalDetailViewModel, SnapshotVote } from '../types';

type SnapshotSummaryCardProps = {
  proposal: ProposalDetailViewModel;
};

const voteToneClassName: Record<SnapshotVote['tone'], string> = {
  success: 'bg-emerald-500',
  danger: 'bg-rose-500',
  muted: 'bg-muted-foreground',
};

export function SnapshotSummaryCard({ proposal }: SnapshotSummaryCardProps) {
  return (
    <Card className='rounded-none border-border/80 bg-card py-0 shadow-none'>
      <CardContent className='space-y-5 p-6'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='space-y-2'>
            <div className='flex flex-wrap items-center gap-3'>
              <h2 className='font-semibold font-serif text-2xl text-foreground'>ARFC (Snapshot)</h2>
              <span className='border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-semibold text-emerald-500 text-xs leading-none'>
                PASSED
              </span>
            </div>
            <p className='text-muted-foreground text-sm'>
              {proposal.snapshotId ? `Snapshot proposal ${proposal.snapshotId}` : 'Snapshot voting summary'}
            </p>
          </div>

          <Button asChild={Boolean(proposal.snapshotUrl)} variant='outline' className='w-fit'>
            {proposal.snapshotUrl ? (
              <Link href={proposal.snapshotUrl} target='_blank' rel='noreferrer'>
                View on Snapshot
                <ExternalLink className='size-4' />
              </Link>
            ) : (
              <span>Snapshot unavailable</span>
            )}
          </Button>
        </div>

        <div className='space-y-3'>
          {SNAPSHOT_VOTES.map((vote) => (
            <div key={vote.label} className='grid grid-cols-[88px_1fr_64px] items-center gap-4 text-sm'>
              <span className='font-medium text-foreground'>{vote.label}</span>
              <div className='h-2 overflow-hidden bg-muted'>
                <div className={cn('h-full', voteToneClassName[vote.tone])} style={{ width: `${vote.percentage}%` }} />
              </div>
              <span className='text-right font-semibold text-foreground'>{vote.value}</span>
            </div>
          ))}
        </div>

        <div className='flex items-center justify-between border-border border-t pt-4 text-muted-foreground text-sm'>
          <span>Ended 10 days ago</span>
          <span>Quorum reached</span>
        </div>
      </CardContent>
    </Card>
  );
}
