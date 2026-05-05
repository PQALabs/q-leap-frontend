import { ArrowRight, Info } from 'lucide-react';
import type { ProposalTopAddress } from '../proposal-detail.data';

interface TopAddressesCardProps {
  addresses: ProposalTopAddress[];
}

export function TopAddressesCard({ addresses }: TopAddressesCardProps) {
  return (
    <section className='overflow-hidden rounded-xs border border-border bg-card shadow-sm'>
      <div className='flex items-center justify-between gap-4 px-7 py-7'>
        <h2 className='font-serif text-foreground text-xl tracking-tight'>Top Voters</h2>
        <button
          type='button'
          aria-label='Top Voters Info'
          className='inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        >
          <Info className='size-5' strokeWidth={2.5} />
        </button>
      </div>

      <div className='grid grid-cols-[64px_minmax(0,1fr)_112px] border-border border-y bg-muted/20 px-7 py-3 font-bold text-muted-foreground text-xs uppercase tracking-[0.16em]'>
        <span className='text-center'>#</span>
        <span>Voters</span>
        <span className='text-center'>Power</span>
      </div>

      <div>
        {addresses.slice(0, 3).map((voter, index) => (
          <div
            key={voter.name}
            className='grid min-h-[40px] grid-cols-[64px_minmax(0,1fr)_112px] items-center border-border border-b px-7 last:border-b-0'
          >
            <span className='text-center font-mono text-muted-foreground'>{index + 1}</span>
            <span className='truncate font-mono text-foreground'>{voter.name}</span>
            <span className='text-center font-mono text-foreground'>{voter.amount}</span>
          </div>
        ))}
      </div>

      <button
        type='button'
        className='flex w-full items-center justify-center gap-2 border-border border-t px-7 py-5 font-bold text-primary text-xs uppercase tracking-[0.16em] transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
      >
        View All
        <ArrowRight className='size-5' strokeWidth={2.5} />
      </button>
    </section>
  );
}
