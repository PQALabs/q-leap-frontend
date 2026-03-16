import { ChevronRight } from 'lucide-react';
import React, { type ReactElement } from 'react';
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { cn } from '@/lib/utils';

type Props = {
  onClick: () => void;
  isConnecting: boolean;
  isLoading?: boolean;
  name: string;
  description?: string;
  icon?: ReactElement;
  checkReady?: () => Promise<boolean>;
  disabled?: boolean;
};

export const ConnectorItem = ({
  name,
  description,
  onClick,
  isConnecting,
  isLoading = false,
  icon,
  checkReady,
  disabled,
}: Props) => {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const isReady = await checkReady?.();
      setReady(isReady || false);
    })();
  }, [checkReady]);

  const isDisabled = isLoading || isConnecting || !ready || disabled;

  return (
    <Item
      onClick={!isDisabled ? onClick : undefined}
      className={cn(
        'cursor-pointer rounded-xs border border-border bg-card transition-colors hover:border-border/80 hover:bg-accent/60',
        isDisabled && 'pointer-events-none cursor-not-allowed opacity-50'
      )}
    >
      <ItemMedia className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>{icon}</ItemMedia>
      <ItemContent className='gap-0.5'>
        <ItemTitle className='font-semibold text-base text-foreground'>{name}</ItemTitle>
        {description && (
          <ItemDescription className='text-left text-muted-foreground text-sm'>{description}</ItemDescription>
        )}
      </ItemContent>
      <ItemActions>
        <ChevronRight className='h-4 w-4 text-muted-foreground transition-transform group-hover/item:translate-x-0.5 group-hover/item:text-foreground' />
      </ItemActions>
    </Item>
  );
};
