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
        'cursor-pointer rounded-xl border border-gray-800 bg-[#090E1680] hover:bg-[#090E16]',
        isDisabled && 'pointer-events-none cursor-not-allowed opacity-50'
      )}
    >
      <ItemMedia className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>{icon}</ItemMedia>
      <ItemContent className='gap-0'>
        <ItemTitle className='font-medium text-base text-white'>{name}</ItemTitle>
        {description && <ItemDescription className='text-left text-foreground text-sm'>{description}</ItemDescription>}
      </ItemContent>
      <ItemActions>
        <ChevronRight className='h-5 w-5 text-foreground group-hover/item:text-white' />
      </ItemActions>
    </Item>
  );
};
