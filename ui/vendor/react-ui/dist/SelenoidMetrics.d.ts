import type { HTMLAttributes } from 'react';
export type SelenoidMetricsVariant = 'header' | 'tile';
export interface SelenoidMetricsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    /** Used capacity percent (shown with `%` unit). */
    usedPercent: number;
    queued: number;
    /** Ready warm-pool slots (shown as `ready / total`). */
    warmReady: number;
    /** Configured warm-pool size. */
    warmTotal: number;
    quotaUsed: number;
    quotaPending: number;
    quotaTotal: number;
    /** Layout shell: `header` (slot) or `tile` (dashboard). Defaults to `header`. */
    variant?: SelenoidMetricsVariant;
    'data-testid'?: string;
}
export declare function SelenoidMetrics({ usedPercent, queued, warmReady, warmTotal, quotaUsed, quotaPending, quotaTotal, variant, className, 'aria-label': ariaLabel, 'data-testid': dataTestId, ...rest }: SelenoidMetricsProps): import("react").JSX.Element;
//# sourceMappingURL=SelenoidMetrics.d.ts.map