import {
  createUseReadContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
  createUseWriteContract,
} from 'wagmi/codegen';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// erc20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20Abi = [
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// lending-pool
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lendingPoolAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'reserve',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'user',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'onBehalfOf',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'borrowRateMode',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'borrowRate',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'referral',
        internalType: 'uint16',
        type: 'uint16',
        indexed: true,
      },
    ],
    name: 'Borrow',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'reserve',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'user',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'onBehalfOf',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'referral',
        internalType: 'uint16',
        type: 'uint16',
        indexed: true,
      },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'target',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'initiator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'asset',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'premium',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'referralCode',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'FlashLoan',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'collateralAsset',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'debtAsset',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'debtToCover',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'liquidatedCollateralAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'liquidator',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'receiveAToken',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
    ],
    name: 'LiquidationCall',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'Paused' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'reserve',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'RebalanceStableBorrowRate',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'reserve',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'repayer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Repay',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'reserve',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'liquidityRate',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'stableBorrowRate',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'variableBorrowRate',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'liquidityIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'variableBorrowIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ReserveDataUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'reserve',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'ReserveUsedAsCollateralDisabled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'reserve',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'ReserveUsedAsCollateralEnabled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'reserve',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'rateMode',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Swap',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenRescued',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'receiver',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amountRescued',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TokensRescued',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'Unpaused' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'reserve',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Withdraw',
  },
  {
    type: 'function',
    inputs: [],
    name: 'FLASHLOAN_PREMIUM_TOTAL',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'LENDINGPOOL_REVISION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_NUMBER_RESERVES',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_STABLE_RATE_BORROW_SIZE_PERCENT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'asset', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'interestRateMode', internalType: 'uint256', type: 'uint256' },
      { name: 'referralCode', internalType: 'uint16', type: 'uint16' },
      { name: 'onBehalfOf', internalType: 'address', type: 'address' },
    ],
    name: 'borrow',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'asset', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'onBehalfOf', internalType: 'address', type: 'address' },
      { name: 'referralCode', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'asset', internalType: 'address', type: 'address' },
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'balanceFromBefore', internalType: 'uint256', type: 'uint256' },
      { name: 'balanceToBefore', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'finalizeTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'receiverAddress', internalType: 'address', type: 'address' },
      { name: 'assets', internalType: 'address[]', type: 'address[]' },
      { name: 'amounts', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'modes', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'onBehalfOf', internalType: 'address', type: 'address' },
      { name: 'params', internalType: 'bytes', type: 'bytes' },
      { name: 'referralCode', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'flashLoan',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAddressesProvider',
    outputs: [
      {
        name: '',
        internalType: 'contract ILendingPoolAddressesProvider',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'asset', internalType: 'address', type: 'address' }],
    name: 'getConfiguration',
    outputs: [
      {
        name: '',
        internalType: 'struct DataTypes.ReserveConfigurationMap',
        type: 'tuple',
        components: [{ name: 'data', internalType: 'uint256', type: 'uint256' }],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'asset', internalType: 'address', type: 'address' }],
    name: 'getReserveData',
    outputs: [
      {
        name: '',
        internalType: 'struct DataTypes.ReserveData',
        type: 'tuple',
        components: [
          {
            name: 'configuration',
            internalType: 'struct DataTypes.ReserveConfigurationMap',
            type: 'tuple',
            components: [{ name: 'data', internalType: 'uint256', type: 'uint256' }],
          },
          { name: 'liquidityIndex', internalType: 'uint128', type: 'uint128' },
          {
            name: 'variableBorrowIndex',
            internalType: 'uint128',
            type: 'uint128',
          },
          {
            name: 'currentLiquidityRate',
            internalType: 'uint128',
            type: 'uint128',
          },
          {
            name: 'currentVariableBorrowRate',
            internalType: 'uint128',
            type: 'uint128',
          },
          {
            name: 'currentStableBorrowRate',
            internalType: 'uint128',
            type: 'uint128',
          },
          {
            name: 'lastUpdateTimestamp',
            internalType: 'uint40',
            type: 'uint40',
          },
          { name: 'aTokenAddress', internalType: 'address', type: 'address' },
          {
            name: 'stableDebtTokenAddress',
            internalType: 'address',
            type: 'address',
          },
          {
            name: 'variableDebtTokenAddress',
            internalType: 'address',
            type: 'address',
          },
          {
            name: 'interestRateStrategyAddress',
            internalType: 'address',
            type: 'address',
          },
          { name: 'id', internalType: 'uint8', type: 'uint8' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'asset', internalType: 'address', type: 'address' }],
    name: 'getReserveNormalizedIncome',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'asset', internalType: 'address', type: 'address' }],
    name: 'getReserveNormalizedVariableDebt',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getReservesList',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserAccountData',
    outputs: [
      { name: 'totalCollateralETH', internalType: 'uint256', type: 'uint256' },
      { name: 'totalDebtETH', internalType: 'uint256', type: 'uint256' },
      { name: 'availableBorrowsETH', internalType: 'uint256', type: 'uint256' },
      {
        name: 'currentLiquidationThreshold',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'ltv', internalType: 'uint256', type: 'uint256' },
      { name: 'healthFactor', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserConfiguration',
    outputs: [
      {
        name: '',
        internalType: 'struct DataTypes.UserConfigurationMap',
        type: 'tuple',
        components: [{ name: 'data', internalType: 'uint256', type: 'uint256' }],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'asset', internalType: 'address', type: 'address' },
      { name: 'aTokenAddress', internalType: 'address', type: 'address' },
      { name: 'stableDebtAddress', internalType: 'address', type: 'address' },
      { name: 'variableDebtAddress', internalType: 'address', type: 'address' },
      {
        name: 'interestRateStrategyAddress',
        internalType: 'address',
        type: 'address',
      },
    ],
    name: 'initReserve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'provider',
        internalType: 'contract ILendingPoolAddressesProvider',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collateralAsset', internalType: 'address', type: 'address' },
      { name: 'debtAsset', internalType: 'address', type: 'address' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'debtToCover', internalType: 'uint256', type: 'uint256' },
      { name: 'receiveAToken', internalType: 'bool', type: 'bool' },
    ],
    name: 'liquidationCall',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'asset', internalType: 'address', type: 'address' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'rebalanceStableBorrowRate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'asset', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'rateMode', internalType: 'uint256', type: 'uint256' },
      { name: 'onBehalfOf', internalType: 'address', type: 'address' },
    ],
    name: 'repay',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'rescueTokens',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'asset', internalType: 'address', type: 'address' },
      { name: 'configuration', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setConfiguration',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'val', internalType: 'bool', type: 'bool' }],
    name: 'setPause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'asset', internalType: 'address', type: 'address' },
      { name: 'rateStrategyAddress', internalType: 'address', type: 'address' },
    ],
    name: 'setReserveInterestRateStrategyAddress',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'asset', internalType: 'address', type: 'address' },
      { name: 'useAsCollateral', internalType: 'bool', type: 'bool' },
    ],
    name: 'setUserUseReserveAsCollateral',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'asset', internalType: 'address', type: 'address' },
      { name: 'rateMode', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'swapBorrowRateMode',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'asset', internalType: 'address', type: 'address' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'swapToVariable',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'asset', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'withdraw',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ui-pool-data-provider-v2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const uiPoolDataProviderV2Abi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_networkBaseTokenPriceInUsdProxyAggregator',
        internalType: 'contract IChainlinkAggregator',
        type: 'address',
      },
      {
        name: '_marketReferenceCurrencyPriceInUsdProxyAggregator',
        internalType: 'contract IChainlinkAggregator',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ETH_CURRENCY_UNIT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MKRAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_bytes32', internalType: 'bytes32', type: 'bytes32' }],
    name: 'bytes32ToString',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'provider',
        internalType: 'contract ILendingPoolAddressesProvider',
        type: 'address',
      },
    ],
    name: 'getReservesData',
    outputs: [
      {
        name: '',
        internalType: 'struct IUiPoolDataProviderV2.AggregatedReserveData[]',
        type: 'tuple[]',
        components: [
          { name: 'underlyingAsset', internalType: 'address', type: 'address' },
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'symbol', internalType: 'string', type: 'string' },
          { name: 'decimals', internalType: 'uint256', type: 'uint256' },
          {
            name: 'baseLTVasCollateral',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'reserveLiquidationThreshold',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'reserveLiquidationBonus',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'reserveFactor', internalType: 'uint256', type: 'uint256' },
          {
            name: 'usageAsCollateralEnabled',
            internalType: 'bool',
            type: 'bool',
          },
          { name: 'borrowingEnabled', internalType: 'bool', type: 'bool' },
          {
            name: 'stableBorrowRateEnabled',
            internalType: 'bool',
            type: 'bool',
          },
          { name: 'isActive', internalType: 'bool', type: 'bool' },
          { name: 'isFrozen', internalType: 'bool', type: 'bool' },
          { name: 'liquidityIndex', internalType: 'uint128', type: 'uint128' },
          {
            name: 'variableBorrowIndex',
            internalType: 'uint128',
            type: 'uint128',
          },
          { name: 'liquidityRate', internalType: 'uint128', type: 'uint128' },
          {
            name: 'variableBorrowRate',
            internalType: 'uint128',
            type: 'uint128',
          },
          {
            name: 'stableBorrowRate',
            internalType: 'uint128',
            type: 'uint128',
          },
          {
            name: 'lastUpdateTimestamp',
            internalType: 'uint40',
            type: 'uint40',
          },
          { name: 'aTokenAddress', internalType: 'address', type: 'address' },
          {
            name: 'stableDebtTokenAddress',
            internalType: 'address',
            type: 'address',
          },
          {
            name: 'variableDebtTokenAddress',
            internalType: 'address',
            type: 'address',
          },
          {
            name: 'interestRateStrategyAddress',
            internalType: 'address',
            type: 'address',
          },
          {
            name: 'availableLiquidity',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'totalPrincipalStableDebt',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'averageStableRate',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'stableDebtLastUpdateTimestamp',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'totalScaledVariableDebt',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'priceInMarketReferenceCurrency',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'variableRateSlope1',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'variableRateSlope2',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'stableRateSlope1',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'stableRateSlope2',
            internalType: 'uint256',
            type: 'uint256',
          },
        ],
      },
      {
        name: '',
        internalType: 'struct IUiPoolDataProviderV2.BaseCurrencyInfo',
        type: 'tuple',
        components: [
          {
            name: 'marketReferenceCurrencyUnit',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'marketReferenceCurrencyPriceInUsd',
            internalType: 'int256',
            type: 'int256',
          },
          {
            name: 'networkBaseTokenPriceInUsd',
            internalType: 'int256',
            type: 'int256',
          },
          {
            name: 'networkBaseTokenPriceDecimals',
            internalType: 'uint8',
            type: 'uint8',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'provider',
        internalType: 'contract ILendingPoolAddressesProvider',
        type: 'address',
      },
    ],
    name: 'getReservesList',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'provider',
        internalType: 'contract ILendingPoolAddressesProvider',
        type: 'address',
      },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'getUserReservesData',
    outputs: [
      {
        name: '',
        internalType: 'struct IUiPoolDataProviderV2.UserReserveData[]',
        type: 'tuple[]',
        components: [
          { name: 'underlyingAsset', internalType: 'address', type: 'address' },
          {
            name: 'scaledATokenBalance',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'usageAsCollateralEnabledOnUser',
            internalType: 'bool',
            type: 'bool',
          },
          {
            name: 'stableBorrowRate',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'scaledVariableDebt',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'principalStableDebt',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'stableBorrowLastUpdateTimestamp',
            internalType: 'uint256',
            type: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'marketReferenceCurrencyPriceInUsdProxyAggregator',
    outputs: [
      {
        name: '',
        internalType: 'contract IChainlinkAggregator',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'networkBaseTokenPriceInUsdProxyAggregator',
    outputs: [
      {
        name: '',
        internalType: 'contract IChainlinkAggregator',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// uniswap-v3-repay-adapter
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const uniswapV3RepayAdapterAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'ADDRESSES_PROVIDER',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'LENDING_POOL',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ORACLE',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'WETH_ADDRESS',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UNISWAP_V3_ROUTER',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UNISWAP_V3_QUOTER',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_SLIPPAGE_PERCENT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'FLASHLOAN_PREMIUM_TOTAL',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amountOut', internalType: 'uint256', type: 'uint256' },
      { name: 'reserveIn', internalType: 'address', type: 'address' },
      { name: 'reserveOut', internalType: 'address', type: 'address' },
    ],
    name: 'getAmountsIn',
    outputs: [
      { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
      { name: 'relativePrice', internalType: 'uint256', type: 'uint256' },
      { name: 'amountInUsd', internalType: 'uint256', type: 'uint256' },
      { name: 'amountOutUsd', internalType: 'uint256', type: 'uint256' },
      { name: 'path', internalType: 'address[]', type: 'address[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
      { name: 'reserveIn', internalType: 'address', type: 'address' },
      { name: 'reserveOut', internalType: 'address', type: 'address' },
    ],
    name: 'getAmountsOut',
    outputs: [
      { name: 'amountOut', internalType: 'uint256', type: 'uint256' },
      { name: 'relativePrice', internalType: 'uint256', type: 'uint256' },
      { name: 'amountInUsd', internalType: 'uint256', type: 'uint256' },
      { name: 'amountOutUsd', internalType: 'uint256', type: 'uint256' },
      { name: 'path', internalType: 'address[]', type: 'address[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collateralAsset', internalType: 'address', type: 'address' },
      { name: 'debtAsset', internalType: 'address', type: 'address' },
      { name: 'collateralAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'debtRepayAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'debtRateMode', internalType: 'uint256', type: 'uint256' },
      {
        name: 'permitSignature',
        internalType: 'struct PermitSignature',
        type: 'tuple',
        components: [
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'v', internalType: 'uint8', type: 'uint8' },
          { name: 'r', internalType: 'bytes32', type: 'bytes32' },
          { name: 's', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
      { name: 'useEthPath', internalType: 'bool', type: 'bool' },
    ],
    name: 'swapAndRepay',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// weth-gateway
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const wethGatewayAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'lendingPool', internalType: 'address', type: 'address' },
      { name: 'onBehalfOf', internalType: 'address', type: 'address' },
      { name: 'referralCode', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'depositETH',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'lendingPool', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'withdrawETH',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'lendingPool', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'interestRateMode', internalType: 'uint256', type: 'uint256' },
      { name: 'referralCode', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'borrowETH',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'lendingPool', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'rateMode', internalType: 'uint256', type: 'uint256' },
      { name: 'onBehalfOf', internalType: 'address', type: 'address' },
    ],
    name: 'repayETH',
    outputs: [],
    stateMutability: 'payable',
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useReadErc20 = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadErc20TotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'totalSupply',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"decimals"`
 */
export const useReadErc20Decimals = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'decimals',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"symbol"`
 */
export const useReadErc20Symbol = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'symbol',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadErc20BalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'balanceOf',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"allowance"`
 */
export const useReadErc20Allowance = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'allowance',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWriteErc20 = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteErc20Approve = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'approve',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useSimulateErc20 = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateErc20Approve = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
  functionName: 'approve',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lendingPoolAbi}__
 */
export const useReadLendingPool = /*#__PURE__*/ createUseReadContract({
  abi: lendingPoolAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"FLASHLOAN_PREMIUM_TOTAL"`
 */
export const useReadLendingPoolFlashloanPremiumTotal = /*#__PURE__*/ createUseReadContract({
  abi: lendingPoolAbi,
  functionName: 'FLASHLOAN_PREMIUM_TOTAL',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"LENDINGPOOL_REVISION"`
 */
export const useReadLendingPoolLendingpoolRevision = /*#__PURE__*/ createUseReadContract({
  abi: lendingPoolAbi,
  functionName: 'LENDINGPOOL_REVISION',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"MAX_NUMBER_RESERVES"`
 */
export const useReadLendingPoolMaxNumberReserves = /*#__PURE__*/ createUseReadContract({
  abi: lendingPoolAbi,
  functionName: 'MAX_NUMBER_RESERVES',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"MAX_STABLE_RATE_BORROW_SIZE_PERCENT"`
 */
export const useReadLendingPoolMaxStableRateBorrowSizePercent = /*#__PURE__*/ createUseReadContract({
  abi: lendingPoolAbi,
  functionName: 'MAX_STABLE_RATE_BORROW_SIZE_PERCENT',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"getAddressesProvider"`
 */
export const useReadLendingPoolGetAddressesProvider = /*#__PURE__*/ createUseReadContract({
  abi: lendingPoolAbi,
  functionName: 'getAddressesProvider',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"getConfiguration"`
 */
export const useReadLendingPoolGetConfiguration = /*#__PURE__*/ createUseReadContract({
  abi: lendingPoolAbi,
  functionName: 'getConfiguration',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"getReserveData"`
 */
export const useReadLendingPoolGetReserveData = /*#__PURE__*/ createUseReadContract({
  abi: lendingPoolAbi,
  functionName: 'getReserveData',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"getReserveNormalizedIncome"`
 */
export const useReadLendingPoolGetReserveNormalizedIncome = /*#__PURE__*/ createUseReadContract({
  abi: lendingPoolAbi,
  functionName: 'getReserveNormalizedIncome',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"getReserveNormalizedVariableDebt"`
 */
export const useReadLendingPoolGetReserveNormalizedVariableDebt = /*#__PURE__*/ createUseReadContract({
  abi: lendingPoolAbi,
  functionName: 'getReserveNormalizedVariableDebt',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"getReservesList"`
 */
export const useReadLendingPoolGetReservesList = /*#__PURE__*/ createUseReadContract({
  abi: lendingPoolAbi,
  functionName: 'getReservesList',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"getUserAccountData"`
 */
export const useReadLendingPoolGetUserAccountData = /*#__PURE__*/ createUseReadContract({
  abi: lendingPoolAbi,
  functionName: 'getUserAccountData',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"getUserConfiguration"`
 */
export const useReadLendingPoolGetUserConfiguration = /*#__PURE__*/ createUseReadContract({
  abi: lendingPoolAbi,
  functionName: 'getUserConfiguration',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"paused"`
 */
export const useReadLendingPoolPaused = /*#__PURE__*/ createUseReadContract({
  abi: lendingPoolAbi,
  functionName: 'paused',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lendingPoolAbi}__
 */
export const useWriteLendingPool = /*#__PURE__*/ createUseWriteContract({
  abi: lendingPoolAbi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"borrow"`
 */
export const useWriteLendingPoolBorrow = /*#__PURE__*/ createUseWriteContract({
  abi: lendingPoolAbi,
  functionName: 'borrow',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"deposit"`
 */
export const useWriteLendingPoolDeposit = /*#__PURE__*/ createUseWriteContract({
  abi: lendingPoolAbi,
  functionName: 'deposit',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"finalizeTransfer"`
 */
export const useWriteLendingPoolFinalizeTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: lendingPoolAbi,
  functionName: 'finalizeTransfer',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"flashLoan"`
 */
export const useWriteLendingPoolFlashLoan = /*#__PURE__*/ createUseWriteContract({
  abi: lendingPoolAbi,
  functionName: 'flashLoan',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"initReserve"`
 */
export const useWriteLendingPoolInitReserve = /*#__PURE__*/ createUseWriteContract({
  abi: lendingPoolAbi,
  functionName: 'initReserve',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteLendingPoolInitialize = /*#__PURE__*/ createUseWriteContract({
  abi: lendingPoolAbi,
  functionName: 'initialize',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"liquidationCall"`
 */
export const useWriteLendingPoolLiquidationCall = /*#__PURE__*/ createUseWriteContract({
  abi: lendingPoolAbi,
  functionName: 'liquidationCall',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"rebalanceStableBorrowRate"`
 */
export const useWriteLendingPoolRebalanceStableBorrowRate = /*#__PURE__*/ createUseWriteContract({
  abi: lendingPoolAbi,
  functionName: 'rebalanceStableBorrowRate',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"repay"`
 */
export const useWriteLendingPoolRepay = /*#__PURE__*/ createUseWriteContract({
  abi: lendingPoolAbi,
  functionName: 'repay',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"rescueTokens"`
 */
export const useWriteLendingPoolRescueTokens = /*#__PURE__*/ createUseWriteContract({
  abi: lendingPoolAbi,
  functionName: 'rescueTokens',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"setConfiguration"`
 */
export const useWriteLendingPoolSetConfiguration = /*#__PURE__*/ createUseWriteContract({
  abi: lendingPoolAbi,
  functionName: 'setConfiguration',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"setPause"`
 */
export const useWriteLendingPoolSetPause = /*#__PURE__*/ createUseWriteContract({
  abi: lendingPoolAbi,
  functionName: 'setPause',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"setReserveInterestRateStrategyAddress"`
 */
export const useWriteLendingPoolSetReserveInterestRateStrategyAddress = /*#__PURE__*/ createUseWriteContract({
  abi: lendingPoolAbi,
  functionName: 'setReserveInterestRateStrategyAddress',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"setUserUseReserveAsCollateral"`
 */
export const useWriteLendingPoolSetUserUseReserveAsCollateral = /*#__PURE__*/ createUseWriteContract({
  abi: lendingPoolAbi,
  functionName: 'setUserUseReserveAsCollateral',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"swapBorrowRateMode"`
 */
export const useWriteLendingPoolSwapBorrowRateMode = /*#__PURE__*/ createUseWriteContract({
  abi: lendingPoolAbi,
  functionName: 'swapBorrowRateMode',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"swapToVariable"`
 */
export const useWriteLendingPoolSwapToVariable = /*#__PURE__*/ createUseWriteContract({
  abi: lendingPoolAbi,
  functionName: 'swapToVariable',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteLendingPoolWithdraw = /*#__PURE__*/ createUseWriteContract({
  abi: lendingPoolAbi,
  functionName: 'withdraw',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lendingPoolAbi}__
 */
export const useSimulateLendingPool = /*#__PURE__*/ createUseSimulateContract({
  abi: lendingPoolAbi,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"borrow"`
 */
export const useSimulateLendingPoolBorrow = /*#__PURE__*/ createUseSimulateContract({
  abi: lendingPoolAbi,
  functionName: 'borrow',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"deposit"`
 */
export const useSimulateLendingPoolDeposit = /*#__PURE__*/ createUseSimulateContract({
  abi: lendingPoolAbi,
  functionName: 'deposit',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"finalizeTransfer"`
 */
export const useSimulateLendingPoolFinalizeTransfer = /*#__PURE__*/ createUseSimulateContract({
  abi: lendingPoolAbi,
  functionName: 'finalizeTransfer',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"flashLoan"`
 */
export const useSimulateLendingPoolFlashLoan = /*#__PURE__*/ createUseSimulateContract({
  abi: lendingPoolAbi,
  functionName: 'flashLoan',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"initReserve"`
 */
export const useSimulateLendingPoolInitReserve = /*#__PURE__*/ createUseSimulateContract({
  abi: lendingPoolAbi,
  functionName: 'initReserve',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateLendingPoolInitialize = /*#__PURE__*/ createUseSimulateContract({
  abi: lendingPoolAbi,
  functionName: 'initialize',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"liquidationCall"`
 */
export const useSimulateLendingPoolLiquidationCall = /*#__PURE__*/ createUseSimulateContract({
  abi: lendingPoolAbi,
  functionName: 'liquidationCall',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"rebalanceStableBorrowRate"`
 */
export const useSimulateLendingPoolRebalanceStableBorrowRate = /*#__PURE__*/ createUseSimulateContract({
  abi: lendingPoolAbi,
  functionName: 'rebalanceStableBorrowRate',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"repay"`
 */
export const useSimulateLendingPoolRepay = /*#__PURE__*/ createUseSimulateContract({
  abi: lendingPoolAbi,
  functionName: 'repay',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"rescueTokens"`
 */
export const useSimulateLendingPoolRescueTokens = /*#__PURE__*/ createUseSimulateContract({
  abi: lendingPoolAbi,
  functionName: 'rescueTokens',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"setConfiguration"`
 */
export const useSimulateLendingPoolSetConfiguration = /*#__PURE__*/ createUseSimulateContract({
  abi: lendingPoolAbi,
  functionName: 'setConfiguration',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"setPause"`
 */
export const useSimulateLendingPoolSetPause = /*#__PURE__*/ createUseSimulateContract({
  abi: lendingPoolAbi,
  functionName: 'setPause',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"setReserveInterestRateStrategyAddress"`
 */
export const useSimulateLendingPoolSetReserveInterestRateStrategyAddress = /*#__PURE__*/ createUseSimulateContract({
  abi: lendingPoolAbi,
  functionName: 'setReserveInterestRateStrategyAddress',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"setUserUseReserveAsCollateral"`
 */
export const useSimulateLendingPoolSetUserUseReserveAsCollateral = /*#__PURE__*/ createUseSimulateContract({
  abi: lendingPoolAbi,
  functionName: 'setUserUseReserveAsCollateral',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"swapBorrowRateMode"`
 */
export const useSimulateLendingPoolSwapBorrowRateMode = /*#__PURE__*/ createUseSimulateContract({
  abi: lendingPoolAbi,
  functionName: 'swapBorrowRateMode',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"swapToVariable"`
 */
export const useSimulateLendingPoolSwapToVariable = /*#__PURE__*/ createUseSimulateContract({
  abi: lendingPoolAbi,
  functionName: 'swapToVariable',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lendingPoolAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateLendingPoolWithdraw = /*#__PURE__*/ createUseSimulateContract({
  abi: lendingPoolAbi,
  functionName: 'withdraw',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lendingPoolAbi}__
 */
export const useWatchLendingPoolEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: lendingPoolAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lendingPoolAbi}__ and `eventName` set to `"Borrow"`
 */
export const useWatchLendingPoolBorrowEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: lendingPoolAbi,
  eventName: 'Borrow',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lendingPoolAbi}__ and `eventName` set to `"Deposit"`
 */
export const useWatchLendingPoolDepositEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: lendingPoolAbi,
  eventName: 'Deposit',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lendingPoolAbi}__ and `eventName` set to `"FlashLoan"`
 */
export const useWatchLendingPoolFlashLoanEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: lendingPoolAbi,
  eventName: 'FlashLoan',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lendingPoolAbi}__ and `eventName` set to `"LiquidationCall"`
 */
export const useWatchLendingPoolLiquidationCallEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: lendingPoolAbi,
  eventName: 'LiquidationCall',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lendingPoolAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchLendingPoolPausedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: lendingPoolAbi,
  eventName: 'Paused',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lendingPoolAbi}__ and `eventName` set to `"RebalanceStableBorrowRate"`
 */
export const useWatchLendingPoolRebalanceStableBorrowRateEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: lendingPoolAbi,
  eventName: 'RebalanceStableBorrowRate',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lendingPoolAbi}__ and `eventName` set to `"Repay"`
 */
export const useWatchLendingPoolRepayEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: lendingPoolAbi,
  eventName: 'Repay',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lendingPoolAbi}__ and `eventName` set to `"ReserveDataUpdated"`
 */
export const useWatchLendingPoolReserveDataUpdatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: lendingPoolAbi,
  eventName: 'ReserveDataUpdated',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lendingPoolAbi}__ and `eventName` set to `"ReserveUsedAsCollateralDisabled"`
 */
export const useWatchLendingPoolReserveUsedAsCollateralDisabledEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: lendingPoolAbi,
  eventName: 'ReserveUsedAsCollateralDisabled',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lendingPoolAbi}__ and `eventName` set to `"ReserveUsedAsCollateralEnabled"`
 */
export const useWatchLendingPoolReserveUsedAsCollateralEnabledEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: lendingPoolAbi,
  eventName: 'ReserveUsedAsCollateralEnabled',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lendingPoolAbi}__ and `eventName` set to `"Swap"`
 */
export const useWatchLendingPoolSwapEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: lendingPoolAbi,
  eventName: 'Swap',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lendingPoolAbi}__ and `eventName` set to `"TokensRescued"`
 */
export const useWatchLendingPoolTokensRescuedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: lendingPoolAbi,
  eventName: 'TokensRescued',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lendingPoolAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchLendingPoolUnpausedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: lendingPoolAbi,
  eventName: 'Unpaused',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lendingPoolAbi}__ and `eventName` set to `"Withdraw"`
 */
export const useWatchLendingPoolWithdrawEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: lendingPoolAbi,
  eventName: 'Withdraw',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uiPoolDataProviderV2Abi}__
 */
export const useReadUiPoolDataProviderV2 = /*#__PURE__*/ createUseReadContract({
  abi: uiPoolDataProviderV2Abi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uiPoolDataProviderV2Abi}__ and `functionName` set to `"ETH_CURRENCY_UNIT"`
 */
export const useReadUiPoolDataProviderV2EthCurrencyUnit = /*#__PURE__*/ createUseReadContract({
  abi: uiPoolDataProviderV2Abi,
  functionName: 'ETH_CURRENCY_UNIT',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uiPoolDataProviderV2Abi}__ and `functionName` set to `"MKRAddress"`
 */
export const useReadUiPoolDataProviderV2MkrAddress = /*#__PURE__*/ createUseReadContract({
  abi: uiPoolDataProviderV2Abi,
  functionName: 'MKRAddress',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uiPoolDataProviderV2Abi}__ and `functionName` set to `"bytes32ToString"`
 */
export const useReadUiPoolDataProviderV2Bytes32ToString = /*#__PURE__*/ createUseReadContract({
  abi: uiPoolDataProviderV2Abi,
  functionName: 'bytes32ToString',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uiPoolDataProviderV2Abi}__ and `functionName` set to `"getReservesData"`
 */
export const useReadUiPoolDataProviderV2GetReservesData = /*#__PURE__*/ createUseReadContract({
  abi: uiPoolDataProviderV2Abi,
  functionName: 'getReservesData',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uiPoolDataProviderV2Abi}__ and `functionName` set to `"getReservesList"`
 */
export const useReadUiPoolDataProviderV2GetReservesList = /*#__PURE__*/ createUseReadContract({
  abi: uiPoolDataProviderV2Abi,
  functionName: 'getReservesList',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uiPoolDataProviderV2Abi}__ and `functionName` set to `"getUserReservesData"`
 */
export const useReadUiPoolDataProviderV2GetUserReservesData = /*#__PURE__*/ createUseReadContract({
  abi: uiPoolDataProviderV2Abi,
  functionName: 'getUserReservesData',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uiPoolDataProviderV2Abi}__ and `functionName` set to `"marketReferenceCurrencyPriceInUsdProxyAggregator"`
 */
export const useReadUiPoolDataProviderV2MarketReferenceCurrencyPriceInUsdProxyAggregator =
  /*#__PURE__*/ createUseReadContract({
    abi: uiPoolDataProviderV2Abi,
    functionName: 'marketReferenceCurrencyPriceInUsdProxyAggregator',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uiPoolDataProviderV2Abi}__ and `functionName` set to `"networkBaseTokenPriceInUsdProxyAggregator"`
 */
export const useReadUiPoolDataProviderV2NetworkBaseTokenPriceInUsdProxyAggregator = /*#__PURE__*/ createUseReadContract(
  {
    abi: uiPoolDataProviderV2Abi,
    functionName: 'networkBaseTokenPriceInUsdProxyAggregator',
  }
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uniswapV3RepayAdapterAbi}__
 */
export const useReadUniswapV3RepayAdapter = /*#__PURE__*/ createUseReadContract({ abi: uniswapV3RepayAdapterAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uniswapV3RepayAdapterAbi}__ and `functionName` set to `"ADDRESSES_PROVIDER"`
 */
export const useReadUniswapV3RepayAdapterAddressesProvider = /*#__PURE__*/ createUseReadContract({
  abi: uniswapV3RepayAdapterAbi,
  functionName: 'ADDRESSES_PROVIDER',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uniswapV3RepayAdapterAbi}__ and `functionName` set to `"LENDING_POOL"`
 */
export const useReadUniswapV3RepayAdapterLendingPool = /*#__PURE__*/ createUseReadContract({
  abi: uniswapV3RepayAdapterAbi,
  functionName: 'LENDING_POOL',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uniswapV3RepayAdapterAbi}__ and `functionName` set to `"ORACLE"`
 */
export const useReadUniswapV3RepayAdapterOracle = /*#__PURE__*/ createUseReadContract({
  abi: uniswapV3RepayAdapterAbi,
  functionName: 'ORACLE',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uniswapV3RepayAdapterAbi}__ and `functionName` set to `"WETH_ADDRESS"`
 */
export const useReadUniswapV3RepayAdapterWethAddress = /*#__PURE__*/ createUseReadContract({
  abi: uniswapV3RepayAdapterAbi,
  functionName: 'WETH_ADDRESS',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uniswapV3RepayAdapterAbi}__ and `functionName` set to `"UNISWAP_V3_ROUTER"`
 */
export const useReadUniswapV3RepayAdapterUniswapV3Router = /*#__PURE__*/ createUseReadContract({
  abi: uniswapV3RepayAdapterAbi,
  functionName: 'UNISWAP_V3_ROUTER',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uniswapV3RepayAdapterAbi}__ and `functionName` set to `"UNISWAP_V3_QUOTER"`
 */
export const useReadUniswapV3RepayAdapterUniswapV3Quoter = /*#__PURE__*/ createUseReadContract({
  abi: uniswapV3RepayAdapterAbi,
  functionName: 'UNISWAP_V3_QUOTER',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uniswapV3RepayAdapterAbi}__ and `functionName` set to `"MAX_SLIPPAGE_PERCENT"`
 */
export const useReadUniswapV3RepayAdapterMaxSlippagePercent = /*#__PURE__*/ createUseReadContract({
  abi: uniswapV3RepayAdapterAbi,
  functionName: 'MAX_SLIPPAGE_PERCENT',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uniswapV3RepayAdapterAbi}__ and `functionName` set to `"FLASHLOAN_PREMIUM_TOTAL"`
 */
export const useReadUniswapV3RepayAdapterFlashloanPremiumTotal = /*#__PURE__*/ createUseReadContract({
  abi: uniswapV3RepayAdapterAbi,
  functionName: 'FLASHLOAN_PREMIUM_TOTAL',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link uniswapV3RepayAdapterAbi}__
 */
export const useWriteUniswapV3RepayAdapter = /*#__PURE__*/ createUseWriteContract({ abi: uniswapV3RepayAdapterAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link uniswapV3RepayAdapterAbi}__ and `functionName` set to `"getAmountsIn"`
 */
export const useWriteUniswapV3RepayAdapterGetAmountsIn = /*#__PURE__*/ createUseWriteContract({
  abi: uniswapV3RepayAdapterAbi,
  functionName: 'getAmountsIn',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link uniswapV3RepayAdapterAbi}__ and `functionName` set to `"getAmountsOut"`
 */
export const useWriteUniswapV3RepayAdapterGetAmountsOut = /*#__PURE__*/ createUseWriteContract({
  abi: uniswapV3RepayAdapterAbi,
  functionName: 'getAmountsOut',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link uniswapV3RepayAdapterAbi}__ and `functionName` set to `"swapAndRepay"`
 */
export const useWriteUniswapV3RepayAdapterSwapAndRepay = /*#__PURE__*/ createUseWriteContract({
  abi: uniswapV3RepayAdapterAbi,
  functionName: 'swapAndRepay',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link uniswapV3RepayAdapterAbi}__
 */
export const useSimulateUniswapV3RepayAdapter = /*#__PURE__*/ createUseSimulateContract({
  abi: uniswapV3RepayAdapterAbi,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link uniswapV3RepayAdapterAbi}__ and `functionName` set to `"getAmountsIn"`
 */
export const useSimulateUniswapV3RepayAdapterGetAmountsIn = /*#__PURE__*/ createUseSimulateContract({
  abi: uniswapV3RepayAdapterAbi,
  functionName: 'getAmountsIn',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link uniswapV3RepayAdapterAbi}__ and `functionName` set to `"getAmountsOut"`
 */
export const useSimulateUniswapV3RepayAdapterGetAmountsOut = /*#__PURE__*/ createUseSimulateContract({
  abi: uniswapV3RepayAdapterAbi,
  functionName: 'getAmountsOut',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link uniswapV3RepayAdapterAbi}__ and `functionName` set to `"swapAndRepay"`
 */
export const useSimulateUniswapV3RepayAdapterSwapAndRepay = /*#__PURE__*/ createUseSimulateContract({
  abi: uniswapV3RepayAdapterAbi,
  functionName: 'swapAndRepay',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wethGatewayAbi}__
 */
export const useWriteWethGateway = /*#__PURE__*/ createUseWriteContract({
  abi: wethGatewayAbi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wethGatewayAbi}__ and `functionName` set to `"depositETH"`
 */
export const useWriteWethGatewayDepositEth = /*#__PURE__*/ createUseWriteContract({
  abi: wethGatewayAbi,
  functionName: 'depositETH',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wethGatewayAbi}__ and `functionName` set to `"withdrawETH"`
 */
export const useWriteWethGatewayWithdrawEth = /*#__PURE__*/ createUseWriteContract({
  abi: wethGatewayAbi,
  functionName: 'withdrawETH',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wethGatewayAbi}__ and `functionName` set to `"borrowETH"`
 */
export const useWriteWethGatewayBorrowEth = /*#__PURE__*/ createUseWriteContract({
  abi: wethGatewayAbi,
  functionName: 'borrowETH',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wethGatewayAbi}__ and `functionName` set to `"repayETH"`
 */
export const useWriteWethGatewayRepayEth = /*#__PURE__*/ createUseWriteContract({
  abi: wethGatewayAbi,
  functionName: 'repayETH',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wethGatewayAbi}__
 */
export const useSimulateWethGateway = /*#__PURE__*/ createUseSimulateContract({
  abi: wethGatewayAbi,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wethGatewayAbi}__ and `functionName` set to `"depositETH"`
 */
export const useSimulateWethGatewayDepositEth = /*#__PURE__*/ createUseSimulateContract({
  abi: wethGatewayAbi,
  functionName: 'depositETH',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wethGatewayAbi}__ and `functionName` set to `"withdrawETH"`
 */
export const useSimulateWethGatewayWithdrawEth = /*#__PURE__*/ createUseSimulateContract({
  abi: wethGatewayAbi,
  functionName: 'withdrawETH',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wethGatewayAbi}__ and `functionName` set to `"borrowETH"`
 */
export const useSimulateWethGatewayBorrowEth = /*#__PURE__*/ createUseSimulateContract({
  abi: wethGatewayAbi,
  functionName: 'borrowETH',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wethGatewayAbi}__ and `functionName` set to `"repayETH"`
 */
export const useSimulateWethGatewayRepayEth = /*#__PURE__*/ createUseSimulateContract({
  abi: wethGatewayAbi,
  functionName: 'repayETH',
});
