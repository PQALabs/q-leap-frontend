'use client';

import { Pin, PinOff, Shield, ShieldCheck, Trash2 } from 'lucide-react';
import type { ForumUserRole } from '@/api/forum';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function DeletedCommentPlaceholder({ className }: { className?: string }) {
  return (
    <p
      className={`inline-flex items-center gap-3 rounded-xl border border-border border-dashed bg-muted/20 px-4 py-3 text-muted-foreground text-sm italic ${className ?? ''}`}
    >
      <Trash2 className='size-4 shrink-0 text-muted-foreground/80' />
      This comment was removed
    </p>
  );
}

export function AuthorRoleBadge({ role }: { role?: ForumUserRole }) {
  if (role === 'admin') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className='inline-flex size-6 items-center justify-center rounded-full text-primary'>
              <ShieldCheck className='size-3.5 shrink-0' aria-label='Admin' />
            </span>
          </TooltipTrigger>
          <TooltipContent>Admin</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (role === 'moderator') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className='inline-flex size-6 items-center justify-center rounded-full text-primary'>
              <Shield className='size-3.5 shrink-0' aria-label='Moderator' />
            </span>
          </TooltipTrigger>
          <TooltipContent>Moderator</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return null;
}

export function CurrentUserBadge() {
  return (
    <span className='inline-flex items-center rounded-full bg-sky-500/15 px-2.5 py-1 font-semibold text-sky-600 text-xs leading-none dark:text-sky-300'>
      You
    </span>
  );
}

export function PinnedCommentBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className='inline-flex cursor-default items-center gap-1.5 rounded-full border border-primary/40 bg-primary/12 px-2.5 py-1 font-semibold text-primary text-xs shadow-[0_0_0_1px_hsl(var(--primary)/0.08),0_6px_18px_hsl(var(--primary)/0.12)]'>
            <span className='inline-flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground'>
              <Pin className='size-2.5 fill-current' />
            </span>
            Pinned
          </span>
        </TooltipTrigger>
        <TooltipContent>Pinned comment</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

type PinCommentButtonProps = {
  pinned: boolean;
  isPinning?: boolean;
  onClick: () => void;
};

export function PinCommentButton({ pinned, isPinning, onClick }: PinCommentButtonProps) {
  const label = pinned ? 'Unpin comment' : 'Pin comment';
  const buttonClassName = cn(
    'inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-xs outline-none transition-all hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-default disabled:opacity-50',
    pinned ? 'text-foreground' : 'text-muted-foreground/45'
  );

  return (
    <button
      type='button'
      aria-label={isPinning ? 'Updating pin state' : label}
      title={isPinning ? 'Updating...' : label}
      className={buttonClassName}
      disabled={isPinning}
      onClick={onClick}
    >
      {pinned ? <PinOff className='size-4' /> : <Pin className='size-4' />}
    </button>
  );
}
