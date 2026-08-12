import type { InputHTMLAttributes } from 'react';
export type PlaqueFieldLabelVariant = 'param' | 'caption';
export interface PlaqueFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
    label: string;
    className?: string;
    divided?: boolean;
    stretch?: boolean;
    /** `data-param-id` for wiring / e2e. */
    paramId?: string;
    /**
     * `param` → `.plaque-field__label` (configurator ids: `name`, `remoteUrl`).
     * `caption` → `.plaque-field__text` (auth human captions: Login / Password).
     */
    labelVariant?: PlaqueFieldLabelVariant;
}
/**
 * Divided plaque with a text `input` control. Canon:
 * - param id + input → `templates/plaque-field.html` `plaque-field-text`
 * - human caption + input → `plaque-field-caption-input`
 * Thin wrapper — label / divider / control slots stay SSOT in `plaque-field.css`.
 */
export declare function PlaqueField({ label, className, divided, stretch, paramId, labelVariant, id, name, ...inputProps }: PlaqueFieldProps): import("react").JSX.Element;
//# sourceMappingURL=PlaqueField.d.ts.map