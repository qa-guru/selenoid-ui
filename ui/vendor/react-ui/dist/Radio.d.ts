import type { InputHTMLAttributes, ReactNode } from 'react';
export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    children: ReactNode;
    /** Catalog puts `data-testid` on the `<label class="radio">`, not the input. */
    'data-testid'?: string;
}
/**
 * Native radio (`label.radio` + `input.radio__input` + `<span>`).
 * Thin wrapper — markup SSOT: `design-system/templates/radio.html` / `css/radio.css`.
 * Catalog: `preview/primitives.html#section-radio`. Group via shared `name`.
 * Not `radio-card` / `choice-card`, not `PlaqueFieldSeg`, not `Checkbox`.
 */
export declare const Radio: import("react").ForwardRefExoticComponent<RadioProps & import("react").RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=Radio.d.ts.map