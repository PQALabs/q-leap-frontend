import { toast } from 'sonner';

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

export const COMMENT_REPLIES_POLL_INTERVAL = 5_000;

export function isWithinEditWindow(createdAt: string | Date): boolean {
  return Date.now() - new Date(createdAt).getTime() < EDIT_WINDOW_MS;
}

export async function copyCommentLink(commentId: string) {
  const url = new URL(window.location.href);
  url.searchParams.set('commentId', commentId);

  try {
    await navigator.clipboard.writeText(url.toString());
    toast.success('Comment link copied');
  } catch {
    toast.error('Failed to copy comment link');
  }
}
