import { notFound } from 'next/navigation';
import { env } from '@/config/env';
import { ForumProposalDetail } from '@/modules/forum-proposal-detail';

type PageProps = {
  params: Promise<{
    proposalId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  if (!env.ENABLE_FORUM) notFound();

  const { proposalId } = await params;

  return <ForumProposalDetail proposalId={proposalId} />;
}
