import type { ChangeEventHandler, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
export type PlaqueFieldLabelVariant = 'param' | 'caption';
export type PlaqueFieldControlElement = HTMLInputElement | HTMLTextAreaElement;
type PlaqueFieldShared = {
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
    onChange?: ChangeEventHandler<PlaqueFieldControlElement>;
};
export type PlaqueFieldProps = PlaqueFieldShared & Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'onChange'> & Pick<TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'> & {
    /** `textarea` control — note body / comments. Default is single-line `input`. */
    multiline?: boolean;
};
/**
 * Divided plaque with a text `input` or `textarea` control. Canon:
 * - param id + input → `templates/plaque-field.html` `plaque-field-text`
 * - human caption + input → `plaque-field-caption-input`
 * - human caption + textarea → `plaque-field-textarea`
 * Thin wrapper — label / divider / control slots stay SSOT in `plaque-field.css`.
 */
export declare function PlaqueField({ label, className, divided, stretch, paramId, labelVariant, id, name, autoComplete, multiline, rows, onChange, type, ...inputProps }: PlaqueFieldProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=PlaqueField.d.ts.map