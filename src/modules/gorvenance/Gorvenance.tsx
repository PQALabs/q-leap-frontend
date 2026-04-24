'use client';

import { useMemo, useState } from 'react';
import { useConnection } from 'wagmi';
import { DelegatedPower } from './components/DelegatedPower';
import { GovernanceTitle } from './components/GovernanceTitle';
import { type Proposal, type ProposalFilter, ProposalsList } from './components/ProposalsList';
import { YourInfo } from './components/YourInfo';

const proposals: Proposal[] = [
  {
    id: 'eth-risk-params',
    status: 'passed',
    title: 'Aave V3 ETH Risk Parameters Update',
    author: 'Chaos Labs (implemented by Aave Labs)',
    summary: 'Simple Summary This proposal recommends updating risk parameters for ETH on Aave V3.',
    yesLabel: '745K',
    noLabel: '0',
    yesPercent: 100,
    noPercent: 0,
  },
  {
    id: 'wsteth-cbeth-caps',
    status: 'executed',
    title: '[ARFC] Increase Supply and Borrow Caps for wstETH and cbETH on V3 Arbitrum',
    author: 'Llama (implemented by Aave Labs)',
    summary:
      'Simple Summary This proposal aims to increase the supply and borrow caps for wstETH and cbETH on the Arbitrum V3 deployment.',
    yesLabel: '500K',
    noLabel: '500',
    yesPercent: 99.9,
    noPercent: 0.1,
  },
  {
    id: 'gho-borrow-rate',
    status: 'executed',
    title: '[ARFC] Set GHO Borrow Rate to 3%',
    author: 'TokenLogic (implemented by Aave Labs)',
    summary: 'Simple Summary This proposal intends to set the GHO borrow rate to 3% across all networks.',
    yesLabel: '620K',
    noLabel: '0',
    yesPercent: 100,
    noPercent: 0,
  },
];

export function Gorvenance() {
  const { address } = useConnection();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<ProposalFilter>('all');

  const filteredProposals = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return proposals.filter((proposal) => {
      const matchesFilter = filter === 'all' || proposal.status === filter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        proposal.title.toLowerCase().includes(normalizedQuery) ||
        proposal.author.toLowerCase().includes(normalizedQuery) ||
        proposal.summary.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, searchQuery]);

  return (
    <main className='mx-auto flex w-full max-w-7xl flex-col gap-8 py-2 md:gap-10 md:py-6'>
      <GovernanceTitle />

      <div className='grid gap-8 xl:grid-cols-[minmax(0,1fr)_364px] xl:items-start'>
        <ProposalsList
          proposals={filteredProposals}
          searchQuery={searchQuery}
          filter={filter}
          onSearchChange={setSearchQuery}
          onFilterChange={setFilter}
        />

        <aside className='flex flex-col gap-6'>
          <YourInfo address={address} votingPower={0} propositionPower={0} />
          <DelegatedPower />
        </aside>
      </div>
    </main>
  );
}
