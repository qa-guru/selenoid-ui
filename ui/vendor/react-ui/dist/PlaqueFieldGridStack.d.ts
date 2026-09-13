import type { ReactNode } from 'react';
export type PlaqueFieldGridStackAlign = 'magnet' | 'hug';
export interface PlaqueFieldGridStackProps {
    /** Sibling `PlaqueFieldGrid` rows (optional host notes allowed). */
    children: ReactNode;
    /**
     * Divider alignment. `magnet` (default, config panels) →
     * `.plaque-field-grid-stack--magnet` + embed `usePlaqueFieldMagnet`.
     * `hug` → `.plaque-field-grid-stack--hug` zigzag, no magnet JS.
     * Not flex `Stack` (`.stack`).
     */
    align?: PlaqueFieldGridStackAlign;
    /** Magnet module path forwarded to `usePlaqueFieldMagnet`. */
    magnetScriptSrc?: string;
    /**
     * Re-sync magnet when this value changes (catalog load, conditional rows).
     * Defaults to the child count.
     */
    syncKey?: unknown;
    /** Accessible name for the stack. */
    'aria-label'?: string;
    className?: string;
    'data-testid'?: string;
}
/**
 * Sibling-row wrap for configurator plaque grids. Thin wrapper over
 * `.plaque-field-grid-stack` (`css/plaque-field.css`). Magnet measurement stays
 * SSOT in `js/plaque-field-magnet.js` via `usePlaqueFieldMagnet`. Prefer this
 * over a host `div` with raw stack classes, and over `stackMagnet` on a single
 * solo `PlaqueFieldGrid`.
 */
export declare function PlaqueFieldGridStack({ children, align, magnetScriptSrc, syncKey, 'aria-label': ariaLabel, className, 'data-testid': testId, }: PlaqueFieldGridStackProps): import("react").JSX.Element;
//# sourceMappingURL=PlaqueFieldGridStack.d.ts.map