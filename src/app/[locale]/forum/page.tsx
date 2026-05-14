import { notFound } from 'next/navigation';
import { env } from '@/config/env';
import { ForumProposals } from '@/modules/forum-proposals';

export default function Page() {
  if (!env.ENABLE_FORUM) notFound();

  return <ForumProposals />;
}
