import { cn } from '@/lib/utils';

interface ProposalStatusBadgeProps {
  status: string;
  className?: string;
}

const statusClassNames: Record<string, string> = {
  active: 'border-warning/40 bg-warning/10 text-warning',
  executed: 'border-success/40 bg-success/10 text-success',
  failed: 'border-destructive/40 bg-destructive/10 text-destructive',
  passed: 'border-success/40 bg-success/10 text-success',
  queued: 'border-primary/40 bg-primary/10 text-primary',
};

export function ProposalStatusBadge({ status, className }: ProposalStatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const statusLabels: Record<string, string> = {
    active: 'Active',
    executed: 'Executed',
    failed: 'Failed',
    passed: 'Passed',
    queued: 'Queued',
  };

  return (
    <span
      className={cn(
        'inline-flex rounded-xs border px-3 py-1 font-semibold text-[11px] uppercase tracking-[0.24em]',
        statusClassNames[normalizedStatus] ?? 'border-border bg-secondary text-muted-foreground',
        className
      )}
    >
      {statusLabels[normalizedStatus] ?? status}
    </span>
  );
}
