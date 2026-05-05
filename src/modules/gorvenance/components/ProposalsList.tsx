import { Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProposalStatusBadge } from '@/modules/proposal-detail/components/ProposalStatusBadge';
import { ProposalVotingBar } from '@/modules/proposal-detail/components/ProposalVotingBar';

export type ProposalStatus = 'passed' | 'executed';
export type ProposalFilter = 'all' | ProposalStatus;

export interface Proposal {
  id: string;
  status: ProposalStatus;
  title: string;
  author: string;
  summary: string;
  date: string;
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

export function ProposalsList({ proposals, searchQuery, filter, onSearchChange, onFilterChange }: ProposalsListProps) {
  return (
    <section className='flex flex-col gap-6'>
      <div className='flex flex-col gap-4 rounded-xs md:flex-row md:items-center md:justify-between'>
        <h2 className='font-serif text-foreground text-xl leading-none'>Proposals</h2>

        <div className='flex flex-col gap-3 sm:flex-row md:w-auto'>
          <div className='flex rounded-xs border border-border bg-card p-1'>
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type='button'
                onClick={() => onFilterChange(option.value)}
                className={cn(
                  'rounded-lg px-3 py-2 font-semibold text-[10px] uppercase tracking-[0.18em] transition-colors',
                  filter === option.value ? 'bg-accent text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className='flex min-w-0 items-center gap-3 rounded-xs border border-border bg-card px-4 py-2.5 sm:min-w-80'>
            <Search size={16} className='text-muted-foreground' />
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder='Search proposals...'
              className='w-full text-sm outline-none placeholder:text-muted-foreground'
            />
          </label>
        </div>
      </div>

      <div className='flex flex-col gap-4'>
        {proposals.map((proposal) => (
          <article
            key={proposal.id}
            className='hover:-translate-y-0.5 rounded-xs border border-border bg-card p-6 shadow-sm transition-transform duration-200 md:p-10'
          >
            <div className='space-y-7'>
              <ProposalStatusBadge status={proposal.status} />

              <div className='space-y-5'>
                <h3 className='font-serif text-foreground text-xl leading-snug tracking-tight md:text-2xl'>
                  {proposal.title}
                </h3>
                <p className='line-clamp-2 font-mono text-muted-foreground text-sm leading-6 md:line-clamp-1 md:text-base'>
                  {proposal.summary}
                </p>
              </div>

              <ProposalVotingBar
                yesLabel='For'
                yesPercent={proposal.yesPercent}
                noLabel='Against'
                noPercent={proposal.noPercent}
                className='space-y-4'
                labelClassName='text-xs'
                barClassName='h-8'
              />

              <p className='font-mono text-[11px] text-muted-foreground uppercase tracking-[0.14em] md:text-xs'>
                Author: {proposal.author} <span aria-hidden='true'>•</span> {proposal.date}
              </p>
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
