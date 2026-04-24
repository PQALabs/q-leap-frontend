import { Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProposalStatus = 'passed' | 'executed';
export type ProposalFilter = 'all' | ProposalStatus;

export interface Proposal {
  id: string;
  status: ProposalStatus;
  title: string;
  author: string;
  summary: string;
  yesLabel: string;
  noLabel: string;
  yesPercent: number;
  noPercent: number;
}

interface ProposalsListProps {
  proposals: Proposal[];
  searchQuery: string;
  filter: ProposalFilter;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: ProposalFilter) => void;
}

const filterOptions: { label: string; value: ProposalFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Passed', value: 'passed' },
  { label: 'Executed', value: 'executed' },
];

const statusClassNames: Record<ProposalStatus, string> = {
  passed: 'border-success/40 bg-success/10 text-success',
  executed: 'border-primary/20 bg-accent text-primary',
};

export function ProposalsList({ proposals, searchQuery, filter, onSearchChange, onFilterChange }: ProposalsListProps) {
  return (
    <section className='flex flex-col gap-6'>
      <div className='flex flex-col gap-4 rounded-xs border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between'>
        <h2 className='font-serif text-3xl text-foreground leading-none'>Proposals</h2>

        <div className='flex flex-col gap-3 sm:flex-row md:w-auto'>
          <div className='flex rounded-xs border border-border bg-background p-1'>
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type='button'
                onClick={() => onFilterChange(option.value)}
                className={cn(
                  'rounded-lg px-3 py-2 font-semibold text-[11px] uppercase tracking-[0.22em] transition-colors',
                  filter === option.value ? 'bg-accent text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className='flex min-w-0 items-center gap-3 rounded-xs border border-border bg-background px-4 py-2.5 sm:min-w-80'>
            <Search size={18} className='text-muted-foreground' />
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder='Search proposals...'
              className='w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground'
            />
          </label>
        </div>
      </div>

      <div className='flex flex-col gap-4'>
        {proposals.map((proposal) => (
          <article
            key={proposal.id}
            className='hover:-translate-y-0.5 grid gap-6 rounded-xs border border-border bg-card p-6 shadow-sm transition-transform duration-200 md:grid-cols-[minmax(0,1fr)_244px]'
          >
            <div className='space-y-4'>
              <span
                className={cn(
                  'inline-flex rounded-md border px-2.5 py-1 font-semibold text-[10px] uppercase tracking-[0.24em]',
                  statusClassNames[proposal.status]
                )}
              >
                {proposal.status}
              </span>

              <div className='space-y-3'>
                <h3 className='max-w-2xl font-serif text-3xl text-foreground leading-tight tracking-tight'>
                  {proposal.title}
                </h3>
                <p className='text-muted-foreground'>
                  <span className='text-muted-foreground/80'>Author:</span> {proposal.author}
                </p>
                <p className='max-w-2xl text-muted-foreground leading-7'>{proposal.summary}</p>
              </div>
            </div>

            <div className='space-y-5'>
              <VoteRow label='Yae' value={proposal.yesLabel} percent={proposal.yesPercent} tone='yes' />
              <VoteRow label='Nay' value={proposal.noLabel} percent={proposal.noPercent} tone='no' />
            </div>
          </article>
        ))}

        {proposals.length === 0 && (
          <div className='rounded-2xl border border-border border-dashed bg-card px-6 py-12 text-center shadow-sm'>
            <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary'>
              <SlidersHorizontal size={18} />
            </div>
            <h3 className='font-semibold text-lg'>No proposals found</h3>
            <p className='mt-2 text-muted-foreground text-sm'>Adjust the search input or switch the current filter.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function VoteRow({
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
    <div className='space-y-2'>
      <div className='flex items-baseline justify-between gap-3'>
        <div className='flex items-baseline gap-2'>
          <span className='font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.2em]'>{label}</span>
          <span className='font-mono font-semibold text-foreground text-lg'>{value}</span>
        </div>
        <span className='font-semibold text-muted-foreground text-xs'>{percent.toFixed(2)}%</span>
      </div>
      <div className='h-1.5 overflow-hidden rounded-full bg-secondary'>
        <div
          className={cn('h-full rounded-full', tone === 'yes' ? 'bg-success' : 'bg-muted-foreground/30')}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
