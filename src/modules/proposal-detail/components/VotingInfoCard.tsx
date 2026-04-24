import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getProposalVotingInfo, type ProposalVotingData } from '../proposal-voting';
import { ProposalDetailSidebarCard } from './ProposalDetailSidebarCard';

interface VotingInfoCardProps {
  address?: string;
  onConnectWallet: () => void;
  voteData: ProposalVotingData;
  onVoteYae?: () => void;
  onVoteNay?: () => void;
}

export function VotingInfoCard({ address, onConnectWallet, voteData, onVoteYae, onVoteNay }: VotingInfoCardProps) {
  const {
    votingPowerAtStart,
    voteOnProposal,
    showAlreadyVotedMsg,
    showCannotVoteMsg,
    showCanVoteMsg,
    showDidNotParticipateMsg,
    voteOngoing,
  } = getProposalVotingInfo(address, voteData);

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
          {voteOngoing && (
            <div className='space-y-2'>
              <p className='font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.2em]'>Voting Power</p>
              <p className='font-mono text-3xl text-foreground'>{votingPowerAtStart.toFixed(2)}</p>
              <p className='text-muted-foreground text-sm'>(AAVE + stkAAVE)</p>
            </div>
          )}

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
              <p className='mt-1 text-sm opacity-90'>{`With a voting power of ${voteOnProposal.votingPower}`}</p>
            </div>
          )}

          {showCannotVoteMsg && (
            <div className='rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning-foreground leading-7'>
              Not enough voting power to participate in this proposal.
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
