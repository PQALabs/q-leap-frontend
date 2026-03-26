import { Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CollateralSwitchProps {
  enabled: boolean;
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  tooltipText?: string;
}

export function CollateralSwitch({ enabled, onClick, disabled, busy, tooltipText }: CollateralSwitchProps) {
  const toggle = (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled || busy}
      className={cn(
        'relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full border transition-colors',
        enabled
          ? 'border-emerald-500 bg-emerald-500 dark:border-emerald-400 dark:bg-emerald-500'
          : 'border-muted-foreground/30 bg-muted dark:border-muted-foreground/40 dark:bg-muted-foreground/20',
        (disabled || busy) && 'cursor-not-allowed opacity-50'
      )}
    >
      {busy ? (
        <Loader2 size={12} className='mx-auto animate-spin text-white' />
      ) : (
        <div
          className={cn(
            'size-3.5 rounded-full bg-white shadow-sm transition-transform',
            enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
          )}
        />
      )}
    </button>
  );

  if (tooltipText) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{toggle}</TooltipTrigger>
        <TooltipContent side='top' className='max-w-[220px] text-xs'>
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    );
  }

  return toggle;
}
