import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { truncateAddress } from '@/lib/wallet';

interface YourInfoProps {
  address?: string;
  votingPower: number;
  propositionPower: number;
}

export function YourInfo({ address, votingPower, propositionPower }: YourInfoProps) {
  const formattedAddress = address ? truncateAddress(address) : 'Not connected';

  return (
    <Card className='gap-0 rounded-xs py-0 shadow-sm'>
      <CardHeader className='border-border border-b px-6 py-6'>
        <CardTitle className='font-serif text-2xl text-foreground'>Your Info</CardTitle>
      </CardHeader>

      <CardContent className='space-y-6 px-6 py-6'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/70 font-semibold text-primary-foreground text-sm'>
            0x
          </div>

          <div className='flex min-w-0 items-center gap-2 text-sm'>
            <span className='truncate font-semibold text-foreground'>{formattedAddress}</span>
            {address && (
              <Link
                href={`https://etherscan.io/address/${address}`}
                target='_blank'
                rel='noreferrer'
                className='text-muted-foreground transition-colors hover:text-primary'
              >
                <ArrowUpRight size={15} />
              </Link>
            )}
          </div>
        </div>

        <div className='grid gap-6 sm:grid-cols-2'>
          <Metric label='Voting Power' value={votingPower.toFixed(2)} />
          <Metric label='Proposition Power' value={propositionPower.toFixed(2)} />
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className='space-y-2'>
      <p className='font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.2em]'>{label}</p>
      <p className='font-bold font-mono text-4xl text-foreground leading-none'>{value}</p>
    </div>
  );
}
