import type { useCollateralToggle } from '@/hooks/use-collateral-toggle';
import type { ComputedUserReserve } from '@/math-utils/formatters/user';
import type { usePoolDataStore } from '@/stores/use-pool-data-store';
import { CollateralSwitch } from './CollateralSwitch';

interface CollateralCellProps {
  ur: ComputedUserReserve;
  user: ReturnType<typeof usePoolDataStore.use.user>;
  reserves: ReturnType<typeof usePoolDataStore.use.reserves>;
  collateralToggle: ReturnType<typeof useCollateralToggle>;
  cannotUseAsCollateralText: string;
  cannotDisableHfText: string;
}

export function CollateralCell({
  ur,
  user,
  reserves,
  collateralToggle,
  cannotUseAsCollateralText,
  cannotDisableHfText,
}: CollateralCellProps) {
  const poolReserve = reserves.find(
    (r) => r.underlyingAsset.toLowerCase() === ur.reserve.underlyingAsset.toLowerCase()
  );
  const poolSupportsCollateral = poolReserve?.usageAsCollateralEnabled ?? false;

  if (!poolSupportsCollateral) {
    return <CollateralSwitch enabled={false} onClick={() => {}} disabled tooltipText={cannotUseAsCollateralText} />;
  }

  const isCurrentlyEnabled = ur.usageAsCollateralEnabledOnUser;
  let disableBlocked = false;

  if (isCurrentlyEnabled && user && Number(user.totalBorrowsMarketReferenceCurrency) > 0) {
    const collAfter =
      Number(user.totalCollateralMarketReferenceCurrency) - Number(ur.underlyingBalanceMarketReferenceCurrency);
    const liqThreshold = Number(user.currentLiquidationThreshold);
    const totalBorrowsMRC = Number(user.totalBorrowsMarketReferenceCurrency);
    const hfAfter = liqThreshold > 0 ? (collAfter * liqThreshold) / totalBorrowsMRC : 0;
    if (hfAfter < 1) disableBlocked = true;
  }

  const isBusy = collateralToggle.togglingAsset === ur.reserve.underlyingAsset.toLowerCase();

  return (
    <CollateralSwitch
      enabled={isCurrentlyEnabled}
      busy={isBusy}
      disabled={isCurrentlyEnabled && disableBlocked}
      tooltipText={isCurrentlyEnabled && disableBlocked ? cannotDisableHfText : undefined}
      onClick={() => collateralToggle.toggle(ur.reserve.underlyingAsset as `0x${string}`, !isCurrentlyEnabled)}
    />
  );
}
