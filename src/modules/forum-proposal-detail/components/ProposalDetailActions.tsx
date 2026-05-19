import { MessageSquare, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type ProposalDetailActionsProps = {
  onCommentClick: () => void;
};

export function ProposalDetailActions({ onCommentClick }: ProposalDetailActionsProps) {
  const handleShareClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Proposal link copied');
    } catch {
      toast.error('Failed to copy proposal link');
    }
  };

  return (
    <aside className='sticky top-24 hidden w-16 shrink-0 flex-col items-center gap-5 lg:flex'>
      <Button variant='ghost' size='icon' aria-label='Comment' onClick={onCommentClick}>
        <MessageSquare className='size-5' />
      </Button>
      <Button variant='ghost' size='icon' aria-label='Share' onClick={handleShareClick}>
        <Share2 className='size-5' />
      </Button>
    </aside>
  );
}
