import { env } from '@/config/env';
import { getRuntimeConfig } from '@/config/runtime-config';
import type {
  BaseNetworkConfig,
  ChainId,
  ExplorerLinkBuilderConfig,
  ExplorerLinkBuilderProps,
  MarketDataType,
  NetworkConfig,
} from '@/types/config/types';
import { marketsData as _marketsData, CustomMarket } from '../../ui-config/markets/index';
import { networkConfigs as _networkConfigs } from '../../ui-config/networks';

export type Pool = {
  address: string;
};

// NOTE: Do NOT read getRuntimeConfig() at module level — it runs before fetchRuntimeConfig()
// has resolved. Read it lazily inside functions instead.

// // determines if forks should be shown
// const FORK_ENABLED = localStorage.getItem('forkEnabled') === 'true';
// // specifies which network was forked
// const FORK_BASE_CHAIN_ID = Number(localStorage.getItem('forkBaseChainId') || 1);
// // specifies on which chainId the fork is running
// const FORK_CHAIN_ID = Number(localStorage.getItem('forkChainId') || 3030);
// const FORK_RPC_URL = localStorage.getItem('forkRPCUrl') || 'http://127.0.0.1:8545';
// const FORK_WS_RPC_URL = localStorage.getItem('forkWsRPCUrl') || 'ws://127.0.0.1:8545';

// determines if forks should be shown
const FORK_ENABLED = false;
// specifies which network was forked
const FORK_BASE_CHAIN_ID = 1;
// specifies on which chainId the fork is running
const FORK_CHAIN_ID = 3030;
const FORK_RPC_URL = 'http://127.0.0.1:8545';
const FORK_WS_RPC_URL = 'ws://127.0.0.1:8545';

/**
 * Generates network configs based on networkConfigs & fork settings.
 * Forks will have a rpcOnly clone of their underlying base network config.
 */
export const networkConfigs = Object.keys(_networkConfigs).reduce(
  (acc, value) => {
    acc[value] = _networkConfigs[value];
    if (FORK_ENABLED && Number(value) === FORK_BASE_CHAIN_ID) {
      acc[FORK_CHAIN_ID] = {
        ..._networkConfigs[value],
        rpcOnly: true,
        isFork: true,
        privateJsonRPCUrl: FORK_RPC_URL,
        privateJsonRPCWSUrl: FORK_WS_RPC_URL,
        underlyingChainId: FORK_BASE_CHAIN_ID,
      };
    }
    return acc;
  },
  {} as { [key: string]: BaseNetworkConfig }
);

/**
 * Generates network configs based on marketsData & fork settings.
 * Fork markets are generated for all markets on the underlying base chain.
 */
export const marketsData = Object.keys(_marketsData).reduce(
  (acc, value) => {
    acc[value] = _marketsData[value as keyof typeof CustomMarket];
    if (FORK_ENABLED && _marketsData[value as keyof typeof CustomMarket].chainId === FORK_BASE_CHAIN_ID) {
      acc[`fork_${value}`] = {
        ..._marketsData[value as keyof typeof CustomMarket],
        chainId: FORK_CHAIN_ID,
      };
    }
    return acc;
  },
  {} as { [key: string]: MarketDataType }
);

export function getDefaultChainId() {
  return marketsData[getAvailableMarkets()[0]].chainId;
}

export function getSupportedChainIds(): number[] {
  const ENABLE_TESTNET = getRuntimeConfig().ENABLE_TESTNET || env.ENABLE_TESTNET;
  return Array.from(
    Object.keys(marketsData).reduce((acc, value) => {
      const chainId = marketsData[value as keyof typeof CustomMarket].chainId;
      const isTestnet = networkConfigs[chainId]?.isTestnet ?? false;
      if (ENABLE_TESTNET || env.ENABLE_TESTNET ? isTestnet : !isTestnet) acc.add(chainId);
      return acc;
    }, new Set<number>())
  );
}

/**
 * selectable markets (markets in a available network + forks when enabled)
 * NOTE: This is a function (not a constant) so it reads getRuntimeConfig() lazily,
 * after fetchRuntimeConfig() has resolved in providers.tsx.
 */
export function getAvailableMarkets(): CustomMarket[] {
  return Object.keys(marketsData).filter((key) =>
    getSupportedChainIds().includes(marketsData[key as keyof typeof CustomMarket].chainId)
  ) as CustomMarket[];
}

const linkBuilder =
  ({ baseUrl, addressPrefix = 'address', txPrefix = 'tx' }: ExplorerLinkBuilderConfig) =>
  ({ tx, address }: ExplorerLinkBuilderProps): string => {
    if (tx) {
      return `${baseUrl}/${txPrefix}/${tx}`;
    }
    if (address) {
      return `${baseUrl}/${addressPrefix}/${address}`;
    }
    return baseUrl;
  };

export function getNetworkConfig(chainId: ChainId): NetworkConfig {
  const config = networkConfigs[chainId];
  if (!config) {
    throw new Error(`Network with chainId "${chainId}" was not configured`);
  }
  return { ...config, explorerLinkBuilder: linkBuilder({ baseUrl: config.explorerLink }) };
}

export const isFeatureEnabled = {
  faucet: (data: MarketDataType) => data.enabledFeatures?.faucet,
  governance: (data: MarketDataType) => data.enabledFeatures?.governance,
  staking: (data: MarketDataType) => data.enabledFeatures?.staking,
  liquiditySwap: (data: MarketDataType) => data.enabledFeatures?.liquiditySwap,
  collateralRepay: (data: MarketDataType) => data.enabledFeatures?.collateralRepay,
  permissions: (data: MarketDataType) => data.enabledFeatures?.permissions,
};

// reexport
export { CustomMarket };
