'use client';

import { Button } from '@/components/ui/button';
import { useMockVotingWeight } from '@/hooks/useMockVotingWeight';
import { cn } from '@/lib/utils';
import { getProposalVotingInfo, type ProposalVotingData } from '../proposal-voting';
import { ProposalDetailSidebarCard } from './ProposalDetailSidebarCard';
import { VotingWeightBreakdown } from './VotingWeightBreakdown';

interface VotingInfoCardProps {
  address?: string;
  onConnectWallet: () => void;
  voteData: ProposalVotingData;
  onVoteYae?: () => void;
  onVoteNay?: () => void;
}

export function VotingInfoCard({ address, onConnectWallet, voteData, onVoteYae, onVoteNay }: VotingInfoCardProps) {
  // veToken voting weight (mock — swap to useVotingWeight() when contract is ready)
  const weightInfo = useMockVotingWeight();

  const {
    voteOnProposal,
    showAlreadyVotedMsg,
    showCannotVoteMsg,
    showCanVoteMsg,
    showDidNotParticipateMsg,
    voteOngoing,
  } = getProposalVotingInfo(address, {
    ...voteData,
    // Override votingPowerAtStart with computed weight so all flags use the new model
    votingPowerAtStart: Number(weightInfo.votingWeight),
  });

  return (
    <ProposalDetailSidebarCard title='Your Voting Info'>
      {!address ? (
        <>
          <p className='max-w-xs text-muted-foreground leading-8'>
            Connect your wallet to participate in governance or view your voting power.
          </p>

          <Button className='mt-2 h-11 w-full font-semibold uppercase tracking-[0.16em]' onClick={onConnectWallet}>
            Connect Wallet to Vote
          </Button>
        </>
      ) : (
        <div className='space-y-4'>
          {/* Voting weight breakdown — shown while vote is ongoing */}
          {voteOngoing && <VotingWeightBreakdown weightInfo={weightInfo} />}

          {showDidNotParticipateMsg && (
            <div className='rounded-xl border border-border bg-muted px-4 py-3 text-muted-foreground text-sm leading-7'>
              You did not participate in this proposal.
            </div>
          )}

          {showAlreadyVotedMsg && voteOnProposal && (
            <div
              className={cn(
                'rounded-xs border px-4 py-3',
                voteOnProposal.support
                  ? 'border-success/30 bg-success/10 text-success'
                  : 'border-destructive/30 bg-destructive/10 text-destructive'
              )}
            >
              <p className='font-semibold text-base'>{`You voted ${voteOnProposal.support ? 'YAE' : 'NAY'}`}</p>
              <p className='mt-1 text-sm opacity-90'>{`With a voting weight of ${voteOnProposal.votingPower}`}</p>
            </div>
          )}

          {showCannotVoteMsg && (
            <div className='rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning-foreground leading-7'>
              Not enough voting weight to participate in this proposal.
            </div>
          )}

          {showCanVoteMsg && (
            <div className='grid gap-3'>
              <Button
                className='h-11 w-full font-semibold uppercase tracking-[0.16em]'
                onClick={onVoteYae}
                disabled={!onVoteYae}
              >
                Vote YAE
              </Button>
              <Button
                variant='outline'
                className='h-11 w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive'
                onClick={onVoteNay}
                disabled={!onVoteNay}
              >
                Vote NAY
              </Button>
            </div>
          )}
        </div>
      )}
    </ProposalDetailSidebarCard>
  );
}
