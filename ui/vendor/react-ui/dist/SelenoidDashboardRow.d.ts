import type { HTMLAttributes } from 'react';
import { type SelenoidMetricsProps } from './SelenoidMetrics';
import { type StatusTileProps } from './StatusTile';
export type SelenoidDashboardRowTileProps = Omit<StatusTileProps, 'variant'>;
export type SelenoidDashboardRowMetricsProps = Omit<SelenoidMetricsProps, 'variant'>;
export interface SelenoidDashboardRowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    /** SSE tile — `StatusTile` `variant="tile"` (template `sse-status`). */
    sse: SelenoidDashboardRowTileProps;
    /** Hub tile — `StatusTile` `variant="tile"` (template `selenoid-status`). */
    selenoid: SelenoidDashboardRowTileProps;
    /** Hub metrics — `SelenoidMetrics` `variant="tile"` (no row-level dividers). */
    metrics: SelenoidDashboardRowMetricsProps;
    'data-testid'?: string;
}
/**
 * Dashboard status + metrics row (`div.selenoid-dashboard-row`). Thin
 * wrapper — markup SSOT: `design-system/templates/selenoid-dashboard-row.html`
 * / `css/selenoid-metrics.css`. Catalog:
 * `preview/session.html#section-selenoid-metrics`
 * (`selenoid-dashboard-row-demo`). Composes `StatusTile` `--tile` ×2 +
 * `SelenoidMetrics` `--tile`. No `PlaqueDivider` between tiles (dividers
 * stay inside metrics). Not `selenoid-header-group`, not `QgInfo`, not
 * `SessionKill`.
 */
export declare function SelenoidDashboardRow({ sse, selenoid, metrics, className, 'data-testid': dataTestId, ...rest }: SelenoidDashboardRowProps): import("react").JSX.Element;
//# sourceMappingURL=SelenoidDashboardRow.d.ts.map