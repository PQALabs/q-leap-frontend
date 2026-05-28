'use client';

import { Ban, Flag, Link2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { ForumUserRole } from '@/api/forum';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type CommentActionsMenuProps = {
  isOwner: boolean;
  isMod: boolean;
  canEdit: boolean;
  isLoggedIn: boolean;
  viewerRole?: ForumUserRole;
  authorRole?: ForumUserRole;
  authorAddress: string;
  onEdit: () => void;
  onDelete: (byModerator: boolean) => void;
  onBan: (address: string) => void;
  onReport: () => void;
  onCopyLink: () => void;
};

function canViewerBan(viewerRole: ForumUserRole | undefined, authorRole: ForumUserRole | undefined): boolean {
  if (viewerRole === 'admin') return authorRole !== 'admin';
  if (viewerRole === 'moderator') return authorRole === 'user' || authorRole === undefined;
  return false;
}

export function CommentActionsMenu({
  isOwner,
  isMod,
  canEdit,
  isLoggedIn,
  viewerRole,
  authorRole,
  authorAddress,
  onEdit,
  onDelete,
  onBan,
  onReport,
  onCopyLink,
}: CommentActionsMenuProps) {
  const canBan = isMod && !isOwner && canViewerBan(viewerRole, authorRole);
  const canReport = isLoggedIn && !isOwner;
  const hasProtectedActions = (isOwner && canEdit) || isOwner || isMod || canBan || canReport;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='size-8 shrink-0 rounded-full text-muted-foreground/80 hover:bg-muted/60 hover:text-foreground'
        >
          <MoreHorizontal className='size-5' />
          <span className='sr-only'>More options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={onCopyLink}>
          <Link2 className='size-4' />
          Copy link
        </DropdownMenuItem>
        {hasProtectedActions && <DropdownMenuSeparator />}
        {isOwner && canEdit && (
          <>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className='size-4' />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {(isOwner || isMod) && (
          <DropdownMenuItem className='text-destructive focus:text-destructive' onClick={() => onDelete(!isOwner)}>
            <Trash2 className='size-4 text-destructive' />
            Delete
          </DropdownMenuItem>
        )}
        {canBan && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='text-destructive focus:text-destructive' onClick={() => onBan(authorAddress)}>
              <Ban className='size-4 text-destructive' />
              Ban Address
            </DropdownMenuItem>
          </>
        )}
        {canReport && (
          <>
            {(isOwner || isMod) && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={onReport}>
              <Flag className='size-4' />
              Report
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
