import { ProposalStatusBadge } from './ProposalStatusBadge';

interface ProposalHeaderProps {
  status: string;
  title: string;
}

export function ProposalHeader({ status, title }: ProposalHeaderProps) {
  return (
    <section className='space-y-4'>
      <ProposalStatusBadge status={status} />
      <h1 className='max-w-5xl font-serif text-4xl text-foreground leading-tight tracking-tight sm:text-5xl'>
        {title}
      </h1>
    </section>
  );
}
