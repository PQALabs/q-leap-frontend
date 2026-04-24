import { ArrowUpRight, Dot } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const resourceLinks = [
  { label: 'Snapshots', href: 'https://snapshot.box/' },
  { label: 'Forum', href: 'https://governance.aave.com/' },
  { label: 'FAQ', href: 'https://aave.com/faq' },
  { label: 'Governance V2', href: 'https://app.aave.com/governance/' },
];

export function GovernanceTitle() {
  return (
    <section className='flex flex-col gap-6 border-border border-b pb-8 md:gap-8 md:pb-10'>
      <div className='space-y-4'>
        <h1 className='font-serif text-4xl text-primary leading-none tracking-tight sm:text-5xl md:text-6xl'>
          Q-LEAP Governance
        </h1>
        <p className='text-balance text-lg text-muted-foreground leading-8'>
          Q-LEAP is a fully decentralized, community-governed protocol. The governance system allows stakeholders to
          propose and vote on upgrades, risk parameters, and strategic directions through a transparent on-chain
          process.
        </p>
      </div>

      <div className='flex flex-wrap gap-3'>
        {resourceLinks.map((link) => (
          <Button key={link.label} variant='outline' size='sm' asChild className='bg-card uppercase tracking-wider'>
            <Link href={link.href} target='_blank' rel='noreferrer'>
              {link.label}
              <ArrowUpRight size={14} />
            </Link>
          </Button>
        ))}
      </div>
    </section>
  );
}
