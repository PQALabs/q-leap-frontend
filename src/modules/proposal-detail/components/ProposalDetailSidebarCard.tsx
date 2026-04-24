export function ProposalDetailSidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className='rounded-xs border border-border bg-card px-7 py-7 shadow-sm'>
      <h2 className='font-serif text-2xl text-foreground tracking-tight'>{title}</h2>
      <div className='mt-6'>{children}</div>
    </section>
  );
}
