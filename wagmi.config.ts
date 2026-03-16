import { Erc20Abi, LendingPoolAbi, UiPoolDataProviderV2ABI } from '@/abi'
import { defineConfig } from '@wagmi/cli'
import { react } from '@wagmi/cli/plugins'

export default defineConfig({
  out: 'src/abi/generated.ts',
  contracts: [
    {
      name: 'erc20',
      abi: Erc20Abi,
    },
    {
      name: 'lending-pool',
      abi: LendingPoolAbi,
    },
    {
      name: 'ui-pool-data-provider-v2',
      abi: UiPoolDataProviderV2ABI,
    }
  ],
  plugins: [
    react() 
  ],
})
