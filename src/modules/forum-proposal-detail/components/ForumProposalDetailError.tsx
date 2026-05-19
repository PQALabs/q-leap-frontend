import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type ForumProposalDetailErrorProps = {
  onRetry: () => void;
  isRetrying: boolean;
};

export function ForumProposalDetailError({ onRetry, isRetrying }: ForumProposalDetailErrorProps) {
  return (
    <main className='min-h-screen bg-background px-4 pt-24 pb-16 md:px-10'>
      <Card className='mx-auto max-w-[720px] rounded-none border-border/80 bg-card py-0 shadow-none'>
        <CardContent className='space-y-4 p-8'>
          <h1 className='font-semibold font-serif text-2xl text-foreground'>Proposal not available</h1>
          <p className='text-muted-foreground'>
            The proposal could not be loaded. It may have been removed or the server did not return a detail response.
          </p>
          <Button onClick={onRetry} loading={isRetrying}>
            Try again
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
