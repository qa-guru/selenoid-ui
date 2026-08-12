import type { ReactNode } from 'react';
export interface PlaqueSelectOption {
    /** Wire value (`<option value>`). */
    value: string;
    /** Visible caption. Defaults to `value`. */
    label?: ReactNode;
}
export interface PlaqueSelectProps {
    /** Config param id / caption rendered in the left label slot. */
    label: string;
    /** Controlled selected value. */
    value?: string;
    /** Uncontrolled initial value. */
    defaultValue?: string;
    options: readonly PlaqueSelectOption[];
    /** Fired with the newly selected option value. */
    onChange?: (value: string) => void;
    /** `data-param-id` for wiring / e2e. */
    paramId?: string;
    disabled?: boolean;
    /** Fill the row (3-col grid) instead of content-hug (default true — canon `plaque-field-select`). */
    stretch?: boolean;
    id?: string;
    /** Accessible name; defaults to `label`. */
    'aria-label'?: string;
    className?: string;
    'data-testid'?: string;
}
/**
 * Divided plaque with a native `select` control (`select.plaque-field__control`).
 * Canon: `templates/plaque-field.html` → `plaque-field-select`. Thin wrapper —
 * the label / divider / control slots stay SSOT in `plaque-field.css`.
 */
export declare function PlaqueSelect({ label, value, defaultValue, options, onChange, paramId, disabled, stretch, id, 'aria-label': ariaLabel, className, 'data-testid': testId, }: PlaqueSelectProps): import("react").JSX.Element;
//# sourceMappingURL=PlaqueSelect.d.ts.map