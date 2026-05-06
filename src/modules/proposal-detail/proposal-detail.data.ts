export interface ProposalVoteResult {
  label: string;
  value: string;
  percent: number;
}

export interface ProposalVotingSummaryMetric {
  label: string;
  value: string;
  target?: string;
  reached?: boolean;
}

export interface ProposalVotingSummaryData {
  yes: ProposalVoteResult;
  no: ProposalVoteResult;
  metrics: ProposalVotingSummaryMetric[];
}

export interface ProposalTopAddress {
  name: string;
  amount: string;
}

export interface ProposalTimelineItem {
  label: string;
  time: string;
  active: boolean;
  emphasized?: boolean;
  italic?: boolean;
}

export interface ProposalVotingResultData {
  votingState: 'active' | 'passed' | 'failed' | 'executed' | 'queued';
  votingPowerAtStart: number;
  votedInfo?: {
    support: boolean;
    votingPower: string;
  } | null;
}

export const proposalDetail = {
  status: 'Passed',
  title: 'GHO Inclusion into E-Modes on Aave V3 Plasma',
  description: `## Author

Phuc Tran

## Summary

This proposal seeks governance approval to include the **GHO stablecoin** into existing E-Modes on the Aave V3 Plasma deployment. The inclusion aims to enhance capital efficiency for users borrowing GHO against correlated assets, specifically stablecoins and staked ETH derivatives, aligning with the broader strategy to bootstrap GHO liquidity and utility across multiple networks.

Following successful technical evaluations and risk parameter recommendations by Chaos Labs, this payload executes the necessary configurations to activate GHO in specific efficiency modes, thereby unlocking higher borrowing power for correlated collateral.

## Specification & Methodology

Chaos Labs has not been compensated by any third party for publishing this recommendation.

## Disclosure

The payload configures the Aave V3 Plasma Pool to add GHO as a borrowable asset within the "Stablecoins" E-Mode category (\`Category ID: 1\`). The risk parameters have been conservatively set to maintain protocol safety while offering improved capital efficiency.

## References

- [Implementation](https://example.com)
- [Tests](https://example.com)
- Snapshot: Direct-to-AIP
- Discussion

## Copyright

Copyright and related rights waived via CC0.`,
  results: {
    yes: { label: 'Yae', value: '684,210.55 AAVE', percent: 99.8 } satisfies ProposalVoteResult,
    no: { label: 'Nay', value: '1,420.00 AAVE', percent: 0.2 } satisfies ProposalVoteResult,
  },
  votingSummary: {
    yes: { label: 'Yae', value: '684,210.55 AAVE', percent: 99.8 },
    no: { label: 'Nay', value: '1,420.00 AAVE', percent: 0.2 },
    metrics: [
      { label: 'Quorum', value: 'Reached', reached: true },
      { label: 'Current Votes', value: '6.73K', target: '6.73K' },
      { label: 'Differential', value: 'Reached', reached: true },
      { label: 'Current Differential', value: '6.73K', target: '6.73K' },
    ],
  } satisfies ProposalVotingSummaryData,
  voteInfo: {
    // Set to 'active' + null votedInfo to preview the VotingWeightBreakdown UI
    votingState: 'active',
    votingPowerAtStart: 0, // overridden by useMockVotingWeight inside VotingInfoCard
    votedInfo: null,
  } satisfies ProposalVotingResultData,
  topAddresses: [
    { name: '0x12a4...8f9e', amount: '250,000' },
    { name: '0x7b3c...11a2', amount: '120,500' },
    { name: 'aavechan.eth', amount: '85,200' },
    { name: '0x99dd...4cc1', amount: '42,100' },
  ] satisfies ProposalTopAddress[],
  timeline: [
    { label: 'Created', time: 'Oct 24, 2023 • 14:30 UTC', active: true },
    { label: 'Active', time: 'Oct 25, 2023 • 09:00 UTC', active: true },
    { label: 'Passed', time: 'Oct 28, 2023 • 15:45 UTC', active: true, emphasized: true },
    { label: 'Execution Pending', time: 'Estimated: ~24h after passing', active: false, italic: true },
  ] satisfies ProposalTimelineItem[],
};
