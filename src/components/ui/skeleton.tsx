import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot='skeleton' className={cn('animate-pulse rounded-xs bg-muted-foreground/20', className)} {...props} />
  );
}

export { Skeleton };
