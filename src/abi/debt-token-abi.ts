/**
 * Minimal ABI for Aave V2 variable/stable debt tokens.
 * Used primarily for `approveDelegation` (native borrow via WETHGateway)
 * and `borrowAllowance` (checking existing delegation).
 */
export const DebtTokenAbi = [
  {
    inputs: [
      { internalType: 'address', name: 'delegatee', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approveDelegation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'fromUser', type: 'address' },
      { internalType: 'address', name: 'toUser', type: 'address' },
    ],
    name: 'borrowAllowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export type DebtTokenAbiType = typeof DebtTokenAbi;
