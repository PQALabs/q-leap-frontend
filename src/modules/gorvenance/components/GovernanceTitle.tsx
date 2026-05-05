import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

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

      <div className='flex flex-wrap items-center gap-x-2 gap-y-4 text-muted-foreground sm:gap-x-2'>
        {resourceLinks.map((link, index) => (
          <div key={link.href} className='flex items-center gap-x-2'>
            {index > 0 ? <span className='mx-2 size-1.5 rounded-full bg-current' aria-hidden='true' /> : null}
            <Link
              href={link.href}
              target='_blank'
              rel='noreferrer'
              className='inline-flex items-center gap-1 font-semibold text-sm uppercase tracking-[0.18em] transition-colors hover:text-primary sm:text-sm'
            >
              {link.label}
              <ExternalLink className='size-4 shrink-0 stroke-[1.8] sm:size-4' aria-hidden='true' />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
