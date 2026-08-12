import type { ReactNode } from 'react';
export interface PlaqueTagstripOption {
    /** Wire value (mapped to `data-value`); membership compares against this. */
    value: string;
    /** Button caption. Defaults to `value`. */
    label?: ReactNode;
    /** Native `title` tooltip. */
    title?: string;
}
export interface PlaqueTagstripProps {
    /** Config param id / caption rendered in the left label slot. */
    label: string;
    options: readonly PlaqueTagstripOption[];
    /** Currently selected values (multi-select). */
    values: readonly string[];
    /** Fired with the toggled option value (add if absent, remove if present). */
    onToggle: (value: string) => void;
    /** `data-param-id` for wiring / e2e. */
    paramId?: string;
    /** Accessible group name; defaults to `label`. */
    'aria-label'?: string;
    className?: string;
    'data-testid'?: string;
}
/**
 * Multi-select tag row inside a divided plaque (`plaque-field-seg-track--many`).
 * Canon: driver `images` row — pill buttons with per-button `aria-pressed`
 * (`role="group"`, **not** a radiogroup and **not** a native checkbox — that is
 * `plaque-field-checkstrip`). Thin wrapper; slots stay SSOT in `plaque-field-seg.css`.
 */
export declare function PlaqueTagstrip({ label, options, values, onToggle, paramId, 'aria-label': ariaLabel, className, 'data-testid': testId, }: PlaqueTagstripProps): import("react").JSX.Element;
//# sourceMappingURL=PlaqueTagstrip.d.ts.map