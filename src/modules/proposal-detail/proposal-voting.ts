export type ProposalVotingState = 'active' | 'passed' | 'failed' | 'executed' | 'queued';

export interface ProposalUserVoteInfo {
  support: boolean;
  votingPower: string;
}

export interface ProposalVotingData {
  votingState: ProposalVotingState;
  votingPowerAtStart: number;
  votedInfo?: ProposalUserVoteInfo | null;
}

export function getProposalVotingInfo(address: string | undefined, voteData: ProposalVotingData) {
  const voteOngoing = voteData.votingState === 'active';
  const didVote = !!voteData.votedInfo && voteData.votedInfo.votingPower !== '0';
  const hasWallet = !!address;

  return {
    voteOngoing,
    didVote,
    votingPowerAtStart: voteData.votingPowerAtStart,
    voteOnProposal: voteData.votedInfo ?? null,
    showAlreadyVotedMsg: hasWallet && didVote,
    showCannotVoteMsg: hasWallet && voteOngoing && voteData.votingPowerAtStart === 0,
    showCanVoteMsg: hasWallet && voteOngoing && !didVote && voteData.votingPowerAtStart !== 0,
    showDidNotParticipateMsg: hasWallet && !didVote && !voteOngoing,
  };
}
