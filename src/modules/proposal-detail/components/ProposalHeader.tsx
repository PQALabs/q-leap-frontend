interface ProposalHeaderProps {
  status: string;
  title: string;
}

export function ProposalHeader({ status, title }: ProposalHeaderProps) {
  return (
    <section className='space-y-4'>
      <span className='inline-flex rounded-xs border border-success/40 bg-success/10 px-3 py-1 font-semibold text-[11px] text-success uppercase tracking-[0.24em]'>
        {status}
      </span>
      <h1 className='max-w-5xl font-serif text-4xl text-foreground leading-tight tracking-tight sm:text-5xl'>
        {title}
      </h1>
    </section>
  );
}
