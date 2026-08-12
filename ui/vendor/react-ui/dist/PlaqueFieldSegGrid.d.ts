import type { ReactNode } from 'react';
export interface PlaqueFieldSegGridProps {
    /** Grid cells — typically `PlaqueFieldSeg` fields. */
    children: ReactNode;
    /**
     * Remote-hub canon (`--mixed --pair`): max 2 per row, content-hug, no ellipsis
     * (skill `configurator-boolean`; 3 flags → 2 + 1). Off by default → dense
     * container-query grid (1 → 2 → 3 cols).
     */
    pair?: boolean;
    /** Wrap each child in `.plaque-field-grid__cell` (default true). */
    wrapCells?: boolean;
    /**
     * Mount the canonical magnet script to align dividers. Embed only — see
     * `usePlaqueFieldMagnet`. No effect on `--pair` (the magnet skips it).
     */
    magnet?: boolean;
    /** Magnet module path forwarded to `usePlaqueFieldMagnet`. */
    magnetScriptSrc?: string;
    /** Accessible group name for the batch. */
    'aria-label'?: string;
    className?: string;
    'data-testid'?: string;
}
/**
 * Dense grid of plaque-field seg cells. Thin wrapper over `.plaque-field-grid`:
 * maps children into `.plaque-field-grid__cell` slots and toggles the remote-hub
 * `--pair` canon. Divider alignment for stack layouts is delegated to the
 * embedded magnet (`magnet` → `usePlaqueFieldMagnet`), never re-implemented here.
 */
export declare function PlaqueFieldSegGrid({ children, pair, wrapCells, magnet, magnetScriptSrc, 'aria-label': ariaLabel, className, 'data-testid': testId, }: PlaqueFieldSegGridProps): import("react").JSX.Element;
//# sourceMappingURL=PlaqueFieldSegGrid.d.ts.map