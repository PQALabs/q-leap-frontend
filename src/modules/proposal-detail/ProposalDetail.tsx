'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useConnection } from 'wagmi';
import { useIntersectionStore } from '@/stores/use-intersection-store';
import { ProposalContent } from './components/ProposalContent';
import { ProposalHeader } from './components/ProposalHeader';
import { ProposalTimelineCard } from './components/ProposalTimelineCard';
import { ProposalVotingSummary } from './components/ProposalVotingSummary';
import { TopAddressesCard } from './components/TopAddressesCard';
import { VotingInfoCard } from './components/VotingInfoCard';
import { proposalDetail } from './proposal-detail.data';

export default function ProposalDetail() {
  const router = useRouter();
  const { address } = useConnection();
  const setTargetInView = useIntersectionStore.use.setTargetInView();

  return (
    <main className='mx-auto flex w-full max-w-7xl flex-col gap-8 py-2 md:gap-10 md:py-6'>
      <button
        type='button'
        onClick={() => (window.history.length > 1 ? router.back() : router.push('/governance'))}
        className='inline-flex w-fit items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground'
      >
        <ArrowLeft size={16} />
      </button>

      <ProposalHeader status={proposalDetail.status} title={proposalDetail.title} />

      <div className='grid gap-8 xl:grid-cols-[minmax(0,1fr)_440px] xl:items-start'>
        <div className='flex flex-col gap-8'>
          <ProposalVotingSummary summary={proposalDetail.votingSummary} />
          <ProposalContent description={proposalDetail.description} />
        </div>

        <aside className='flex flex-col gap-6'>
          <VotingInfoCard
            address={address}
            voteData={proposalDetail.voteInfo}
            onConnectWallet={() => setTargetInView('connectWallet')}
          />
          <TopAddressesCard addresses={proposalDetail.topAddresses} />
          <ProposalTimelineCard items={proposalDetail.timeline} />
        </aside>
      </div>
    </main>
  );
}
