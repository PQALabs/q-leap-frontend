import { ChevronRight, CircleHelp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface YourInfoProps {
  address?: string;
  votingPower: number;
  propositionPower: number;
}

export function YourInfo({ votingPower, propositionPower }: YourInfoProps) {
  return (
    <Card className='gap-0 rounded-xs py-0 shadow-sm'>
      <CardHeader className='border-border border-b px-6 py-5 md:px-8'>
        <CardTitle className='font-serif text-foreground text-xl leading-none'>Your Power</CardTitle>
      </CardHeader>

      <CardContent className='space-y-6 px-6 py-6 md:px-8'>
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2'>
          <Metric label={'Voting Power'} value={votingPower.toFixed(2)} />
          <Metric label={'Proposition Power'} value={propositionPower.toFixed(2)} />
        </div>

        <button
          type='button'
          className='group flex items-center gap-2.5 font-serif text-foreground text-lg transition-colors hover:text-primary'
        >
          <CircleHelp className='size-5 shrink-0 stroke-[2.5]' aria-hidden='true' />
          <span className='font-bold'>Delegate Your Power</span>
          <ChevronRight className='size-6 shrink-0 stroke-[2.5] transition-transform group-hover:translate-x-0.5' />
        </button>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className='space-y-3'>
      <p className='font-semibold text-[11px] text-muted-foreground uppercase'>{label}</p>
      <p className='font-bold font-mono text-3xl text-foreground leading-none'>{value}</p>
    </div>
  );
}
