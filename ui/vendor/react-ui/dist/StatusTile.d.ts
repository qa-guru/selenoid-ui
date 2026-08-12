import type { HTMLAttributes } from 'react';
/** Consumer shorthand → primitive modifier (`status-tile--*`). */
export type StatusTileStatus = 'ok' | 'stale' | 'error' | 'disconnected';
export type StatusTileVariant = 'header' | 'tile';
export type StatusTileModifier = 'connected' | 'stale' | 'error' | 'disconnected';
export interface StatusTileProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    /** Upper label (e.g. `SSE`, `Selenoid`). */
    label: string;
    /** Visible state text (e.g. `Connected`, `Stale`). */
    state: string;
    /**
     * Maps to `status-tile--connected` / `--stale` / `--error` / `--disconnected`.
     * `ok` → `--connected`. Defaults to `ok`.
     */
    status?: StatusTileStatus;
    /** Layout shell: `header` (slot) or `tile` (dashboard). Defaults to `tile`. */
    variant?: StatusTileVariant;
    'data-testid'?: string;
}
export declare function StatusTile({ label, state, status, variant, id, className, title, 'aria-label': ariaLabel, 'data-testid': dataTestId, ...rest }: StatusTileProps): import("react").JSX.Element;
//# sourceMappingURL=StatusTile.d.ts.map