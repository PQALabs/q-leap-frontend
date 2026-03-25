export function StatPill({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex flex-col gap-0.5'>
      <span className='font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>{label}</span>
      <span className='font-bold text-foreground text-lg'>{value}</span>
    </div>
  );
}
