import type { PlaqueFieldSegOption } from './PlaqueFieldSeg';
export type { PlaqueFieldSegOption };
/** At least three options — 2-opt stays on `PlaqueFieldSeg`. */
export type PlaqueFieldSegNOptions = readonly [
    PlaqueFieldSegOption,
    PlaqueFieldSegOption,
    PlaqueFieldSegOption,
    ...PlaqueFieldSegOption[]
];
export interface PlaqueFieldSegNProps {
    /** Config param id / caption rendered in the left label slot. */
    label: string;
    /**
     * N-opt segmented control (3+). Not the 2-opt boolean canon — that stays
     * on `PlaqueFieldSeg` (skill `configurator-boolean`).
     */
    options: PlaqueFieldSegNOptions;
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
 * N-opt segmented control inside a divided plaque (`plaque-field-seg-track--many`).
 * Canon for 3+ value fields (e.g. `pyramidLayer` 7-opt) — buttons are a
 * `radiogroup`, never a native checkbox and never `PlaqueTagstrip` multi-select.
 * 2-opt (`true`/`false`, gradle/maven, …) stays on `PlaqueFieldSeg`. Shell
 * full-width; chips content-hug + flex-end — no `--stretch` class.
 */
export declare function PlaqueFieldSegN({ label, options, value, defaultValue, onValueChange, paramId, 'aria-label': ariaLabel, className, 'data-testid': testId, }: PlaqueFieldSegNProps): import("react").JSX.Element;
//# sourceMappingURL=PlaqueFieldSegN.d.ts.map