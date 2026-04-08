/**
 * Minimal ABI for UniswapV3RepayAdapter
 *
 * NOTE: getAmountsIn / getAmountsOut are declared as "nonpayable" (not "view")
 * because they call Uniswap QuoterV2 which performs internal state mutations.
 * They must be called via simulateContract (callStatic), NOT useReadContract.
 */

export const uniswapV3RepayAdapterAbi = [
  // ─── Constants / addresses ───────────────────────────────────────────────
  {
    type: 'function',
    name: 'ADDRESSES_PROVIDER',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'LENDING_POOL',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'ORACLE',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'WETH_ADDRESS',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'UNISWAP_V3_ROUTER',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'UNISWAP_V3_QUOTER',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'MAX_SLIPPAGE_PERCENT',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'FLASHLOAN_PREMIUM_TOTAL',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },

  // ─── Quote: exact output (how much collateral needed for a given debt amount) ──
  // Non-view — use simulateContract
  {
    type: 'function',
    name: 'getAmountsIn',
    inputs: [
      { name: 'amountOut', type: 'uint256', internalType: 'uint256' },
      { name: 'reserveIn', type: 'address', internalType: 'address' },
      { name: 'reserveOut', type: 'address', internalType: 'address' },
    ],
    outputs: [
      { name: 'amountIn', type: 'uint256', internalType: 'uint256' },
      { name: 'relativePrice', type: 'uint256', internalType: 'uint256' },
      { name: 'amountInUsd', type: 'uint256', internalType: 'uint256' },
      { name: 'amountOutUsd', type: 'uint256', internalType: 'uint256' },
      { name: 'path', type: 'address[]', internalType: 'address[]' },
    ],
    stateMutability: 'nonpayable',
  },

  // ─── Quote: exact input (how much debt repaid for a given collateral amount) ──
  // Non-view — use simulateContract
  {
    type: 'function',
    name: 'getAmountsOut',
    inputs: [
      { name: 'amountIn', type: 'uint256', internalType: 'uint256' },
      { name: 'reserveIn', type: 'address', internalType: 'address' },
      { name: 'reserveOut', type: 'address', internalType: 'address' },
    ],
    outputs: [
      { name: 'amountOut', type: 'uint256', internalType: 'uint256' },
      { name: 'relativePrice', type: 'uint256', internalType: 'uint256' },
      { name: 'amountInUsd', type: 'uint256', internalType: 'uint256' },
      { name: 'amountOutUsd', type: 'uint256', internalType: 'uint256' },
      { name: 'path', type: 'address[]', internalType: 'address[]' },
    ],
    stateMutability: 'nonpayable',
  },

  // ─── Direct repay (no flash loan) ────────────────────────────────────────
  {
    type: 'function',
    name: 'swapAndRepay',
    inputs: [
      { name: 'collateralAsset', type: 'address', internalType: 'address' },
      { name: 'debtAsset', type: 'address', internalType: 'address' },
      { name: 'collateralAmount', type: 'uint256', internalType: 'uint256' },
      { name: 'debtRepayAmount', type: 'uint256', internalType: 'uint256' },
      { name: 'debtRateMode', type: 'uint256', internalType: 'uint256' },
      {
        name: 'permitSignature',
        type: 'tuple',
        internalType: 'struct PermitSignature',
        components: [
          { name: 'amount', type: 'uint256', internalType: 'uint256' },
          { name: 'deadline', type: 'uint256', internalType: 'uint256' },
          { name: 'v', type: 'uint8', internalType: 'uint8' },
          { name: 'r', type: 'bytes32', internalType: 'bytes32' },
          { name: 's', type: 'bytes32', internalType: 'bytes32' },
        ],
      },
      { name: 'useEthPath', type: 'bool', internalType: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;
