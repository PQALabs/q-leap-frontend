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

// --- Voting Weight (veToken model) ---

export interface VotingWeightInfo {
  /** Formatted token balance, e.g. "1000.00" */
  tokenBalance: string;
  /** Lock duration in days, e.g. 730 */
  lockDurationDays: number;
  /** Human-readable lock label, e.g. "2 years" */
  lockDurationLabel: string;
  /** Multiplier: 0.0 → 1.0 */
  multiplier: number;
  /** Voting weight = balance × multiplier */
  votingWeight: string;
  /** Maximum lock days, e.g. 1460 */
  maxLockDays: number;
  /** Percentage of max lock: 0.0 → 1.0 */
  percentOfMax: number;
}
