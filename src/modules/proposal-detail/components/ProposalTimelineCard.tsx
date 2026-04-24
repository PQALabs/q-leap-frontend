import { cn } from '@/lib/utils';
import type { ProposalTimelineItem } from '../proposal-detail.data';
import { ProposalDetailSidebarCard } from './ProposalDetailSidebarCard';

interface ProposalTimelineCardProps {
  items: ProposalTimelineItem[];
}

export function ProposalTimelineCard({ items }: ProposalTimelineCardProps) {
  return (
    <ProposalDetailSidebarCard title='Proposal Timeline'>
      <div className='space-y-0'>
        {items.map((item, index) => (
          <div key={item.label} className='grid grid-cols-[20px_minmax(0,1fr)] gap-5'>
            <div className='flex flex-col items-center pt-1'>
              <span
                className={cn(
                  'h-4 w-4 rounded-full border-4 border-background',
                  item.active ? 'bg-primary' : 'bg-border'
                )}
              />
              {index < items.length - 1 && <span className='mt-2 h-16 w-px bg-border' />}
            </div>
            <div className='pb-8'>
              <p
                className={cn(
                  'font-semibold text-2xl text-foreground leading-none',
                  item.emphasized && 'text-primary',
                  item.italic && 'text-muted-foreground italic'
                )}
              >
                {item.label}
              </p>
              <p className='mt-3 font-mono text-muted-foreground text-sm uppercase tracking-[0.18em]'>{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </ProposalDetailSidebarCard>
  );
}
