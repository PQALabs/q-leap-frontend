import { Button } from '@/components/ui/button';

export function DelegatedPower() {
  return (
    <section className='rounded-xs border border-border bg-card shadow-sm'>
      <div className='border-border border-b px-6 py-6'>
        <h2 className='font-serif text-2xl text-foreground'>Delegated Power</h2>
      </div>

      <div className='space-y-6 px-6 py-6'>
        <p className='text-muted-foreground leading-7'>
          You can delegate your voting power to another address. This allows them to vote on your behalf without taking
          ownership of your tokens.
        </p>

        <Button variant='outline' className='h-11 w-full bg-accent/50 text-primary hover:bg-accent'>
          Set up delegation
        </Button>
      </div>
    </section>
  );
}
