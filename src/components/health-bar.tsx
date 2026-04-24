export function HealthBar({ value }: { value: number }) {
  // No borrows (-1) → full bar
  // Danger (HF < 1.1) → mapped to 0% - 30% (Red zone)
  // Warning (1.1 <= HF < 1.5) → mapped to 30% - 70% (Amber zone)
  // Safe (HF >= 1.5) → mapped to 70% - 100% (Green zone)
  let pct = 0;
  if (value < 0) {
    pct = 100;
  } else if (value < 1.1) {
    pct = (value / 1.1) * 15;
  } else if (value < 1.5) {
    pct = 30 + ((value - 1.1) / 0.4) * 40;
  } else {
    pct = Math.min(70 + ((value - 1.5) / 1.5) * 30, 100);
  }

  return (
    <div className='mt-1 h-2 w-full overflow-hidden rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500'>
      <div
        className='h-full rounded-r-full bg-muted transition-all duration-500'
        style={{ width: `${100 - pct}%`, marginLeft: 'auto' }}
      />
    </div>
  );
}
