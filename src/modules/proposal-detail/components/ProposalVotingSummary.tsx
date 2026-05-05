import { CircleCheck } from 'lucide-react';
import type { ProposalVotingSummaryData } from '../proposal-detail.data';
import { ProposalVotingBar } from './ProposalVotingBar';

interface ProposalVotingSummaryProps {
  summary: ProposalVotingSummaryData;
}

export function ProposalVotingSummary({ summary }: ProposalVotingSummaryProps) {
  const metricLabels: Record<string, string> = {
    Quorum: 'Quorum',
    'Current Votes': 'Current Votes',
    Differential: 'Differential',
    'Current Differential': 'Current Differential',
  };
  const metricValues: Record<string, string> = {
    Reached: 'Reached',
  };

  return (
    <section className='space-y-8'>
      <ProposalVotingBar
        yesLabel={summary.yes.label}
        yesPercent={summary.yes.percent}
        noLabel={summary.no.label}
        noPercent={summary.no.percent}
      />

      <div className='grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-4'>
        {summary.metrics.map((metric) => (
          <div key={metric.label} className='space-y-1'>
            <p className='flex min-h-6 items-start font-semibold text-muted-foreground text-sm uppercase leading-6 lg:min-h-12'>
              {metricLabels[metric.label] ?? metric.label}
            </p>

            <div className='flex items-center gap-1'>
              <p className='font-mono font-semibold text-foreground text-xl tracking-tight'>
                {metricValues[metric.value] ?? metric.value}
                {metric.target && <span className='text-muted-foreground'>/{metric.target}</span>}
              </p>

              {metric.reached && (
                <span className='flex size-8 shrink-0 items-center justify-center text-success'>
                  <CircleCheck size={20} strokeWidth={2.5} />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
