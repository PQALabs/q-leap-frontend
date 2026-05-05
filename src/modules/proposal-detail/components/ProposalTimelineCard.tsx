import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ProposalTimelineItem } from '../proposal-detail.data';
import { ProposalDetailSidebarCard } from './ProposalDetailSidebarCard';

interface ProposalTimelineCardProps {
  items: ProposalTimelineItem[];
}

export function ProposalTimelineCard({ items }: ProposalTimelineCardProps) {
  const timelineLabels: Record<string, string> = {
    Created: 'Created',
    Active: 'Active',
    Passed: 'Passed',
    'Execution Pending': 'Execution Pending',
  };

  return (
    <ProposalDetailSidebarCard title='Proposal Timeline'>
      <div className='space-y-0'>
        {items.map((item, index) => {
          const isCurrent = item.active && item.emphasized;
          const isComplete = item.active && !isCurrent;
          const connectorActive = item.active && items[index + 1]?.active;

          return (
            <div key={item.label} className='grid grid-cols-[44px_minmax(0,1fr)] gap-7'>
              <div className='flex flex-col items-center pt-0.5'>
                <span
                  className={cn(
                    'flex size-8 items-center justify-center rounded-xl border-3 bg-card shadow-sm',
                    isComplete && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary text-primary',
                    !item.active && 'border-border text-border'
                  )}
                >
                  {isComplete ? (
                    <Check className='size-5' strokeWidth={2.5} />
                  ) : (
                    <span className={cn('size-3 rounded-full', isCurrent ? 'bg-primary' : 'bg-border')} />
                  )}
                </span>
                {index < items.length - 1 && (
                  <span className={cn('mt-[3px] h-[72px] w-[3px]', connectorActive ? 'bg-primary' : 'bg-border')} />
                )}
              </div>
              <div className='pt-0.5 pb-8'>
                <p
                  className={cn(
                    'font-semibold text-foreground leading-none',
                    item.emphasized && 'text-primary',
                    item.italic && 'text-muted-foreground italic'
                  )}
                >
                  {timelineLabels[item.label] ?? item.label}
                </p>
                <p className='mt-1 font-mono text-muted-foreground text-xs uppercase'>{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </ProposalDetailSidebarCard>
  );
}
