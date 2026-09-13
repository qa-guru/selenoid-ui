export interface PlaqueNumberProps {
    /** Config param id / caption rendered in the left label slot. */
    label: string;
    /** Controlled numeric value. */
    value?: number;
    /** Uncontrolled initial value. */
    defaultValue?: number;
    min?: number;
    max?: number;
    /** Native `step`. Defaults to `1` (canon `headerHeight`). */
    step?: number;
    /** Fired with the new number after typing or a ± click. */
    onChange?: (value: number) => void;
    /** `data-param-id` for wiring / e2e. */
    paramId?: string;
    disabled?: boolean;
    /** Fill the row (3-col grid). Default true — CSS places `.plaque-number` in column 3. */
    stretch?: boolean;
    id?: string;
    /** Accessible name for the spinbutton; defaults to `label`. */
    'aria-label'?: string;
    className?: string;
    /** Catalog / template id. Defaults to `plaque-field-number`. */
    'data-testid'?: string;
}
/**
 * Divided stretch plaque with a ± number stepper (`span.plaque-number` +
 * `input.plaque-field__control`). Canon: `templates/plaque-field.html`
 * `plaque-field-number` / `preview/fields.html#section-plaque-field`
 * (`headerHeight` 22, min 16, max 120). Thin wrapper — slots stay SSOT in
 * `plaque-field.css` (imports `plaque-number.css`). Not `PlaqueField` text.
 */
export declare function PlaqueNumber({ label, value, defaultValue, min, max, step, onChange, paramId, disabled, stretch, id, 'aria-label': ariaLabel, className, 'data-testid': testId, }: PlaqueNumberProps): import("react").JSX.Element;
//# sourceMappingURL=PlaqueNumber.d.ts.map