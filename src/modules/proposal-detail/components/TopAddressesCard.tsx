import type { ProposalTopAddress } from '../proposal-detail.data';
import { ProposalDetailSidebarCard } from './ProposalDetailSidebarCard';

interface TopAddressesCardProps {
  addresses: ProposalTopAddress[];
}

export function TopAddressesCard({ addresses }: TopAddressesCardProps) {
  return (
    <ProposalDetailSidebarCard title='Top Addresses'>
      <div className='space-y-5'>
        {addresses.map((voter) => (
          <div key={voter.name} className='flex items-center justify-between gap-4'>
            <div className='flex min-w-0 items-center gap-3'>
              <span className='h-6 w-6 rounded-full bg-primary/20' />
              <span className='truncate font-mono text-foreground text-lg'>{voter.name}</span>
            </div>
            <span className='font-mono text-lg text-primary'>{voter.amount}</span>
          </div>
        ))}
      </div>

      <button type='button' className='mt-8 font-semibold text-primary text-sm uppercase tracking-[0.2em]'>
        View All Voters
      </button>
    </ProposalDetailSidebarCard>
  );
}
