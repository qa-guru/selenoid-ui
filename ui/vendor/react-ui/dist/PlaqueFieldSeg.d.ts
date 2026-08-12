import type { ReactNode } from 'react';
export interface PlaqueFieldSegOption {
    /** Wire value (mapped to `data-value`); active state compares against this. */
    value: string;
    /** Button caption. Defaults to `value`. */
    label?: ReactNode;
    /** Native `title` tooltip (long forms of short captions). */
    title?: string;
}
export interface PlaqueFieldSegProps {
    /** Config param id / caption rendered in the left label slot. */
    label: string;
    /**
     * Exactly two options for a 2-opt segmented control. Defaults to the boolean
     * `true` / `false` canon (skill `configurator-boolean`).
     */
    options?: readonly [PlaqueFieldSegOption, PlaqueFieldSegOption];
    /** Controlled selected value. */
    value?: string;
    /** Uncontrolled initial value (defaults to the first option). */
    defaultValue?: string;
    /** Fired with the newly selected option value. */
    onValueChange?: (value: string) => void;
    /** `data-param-id` for wiring / e2e (`syncControlButtons`). */
    paramId?: string;
    /** Accessible group name; defaults to `label`. */
    'aria-label'?: string;
    className?: string;
    'data-testid'?: string;
}
/**
 * 2-opt segmented control inside a divided plaque (`plaque-field-seg-track--many`).
 * Canon for any two-value field, including boolean `true` / `false`
 * (skill `configurator-boolean`) — buttons are a `radiogroup`, never a native
 * checkbox. Shell full-width; chips content-hug + flex-end — no `--stretch`
 * class (that class stretches select/input controls only).
 */
export declare function PlaqueFieldSeg({ label, options, value, defaultValue, onValueChange, paramId, 'aria-label': ariaLabel, className, 'data-testid': testId, }: PlaqueFieldSegProps): import("react").JSX.Element;
//# sourceMappingURL=PlaqueFieldSeg.d.ts.map