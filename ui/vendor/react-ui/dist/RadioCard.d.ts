import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    /** Catalog heading — `h3.radio-group__title`. */
    title?: ReactNode;
    children: ReactNode;
}
/**
 * Radio-card group (`.radio-group` + `h3.radio-group__title` + `.stack.stack--sm`).
 * Thin wrapper — markup SSOT: `design-system/templates/radio-card.html` / `css/choice-card.css`.
 * Catalog: `preview/fields.html#section-radio-card`. Pair with `RadioCard`; cards share `name`.
 */
export declare function RadioGroup({ title, className, children, ...rest }: RadioGroupProps): import("react").JSX.Element;
export interface RadioCardProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    children: ReactNode;
    /** Catalog modifier → `.radio-card--muted`. Visual only; not `disabled`. */
    muted?: boolean;
    /** Catalog puts `data-testid` on the `<label class="radio-card">`, not the input. */
    'data-testid'?: string;
    /** Catalog input id, e.g. `radio-card-input-a`. */
    inputTestId?: string;
}
/**
 * Radio card (`label.radio-card` + `input.radio__input` + `.radio-card__body`).
 * Thin wrapper — markup SSOT: `design-system/templates/radio-card.html` / `css/choice-card.css`.
 * Input chrome stays `radio.css` (`.radio__input`). Catalog: `preview/fields.html#section-radio-card`.
 * Group via shared `name`. Not native `Radio`, not `Checkbox` / `checkbox-card`,
 * not `.plaque-field-check`, not `PlaqueFieldSeg`.
 */
export declare const RadioCard: import("react").ForwardRefExoticComponent<RadioCardProps & import("react").RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=RadioCard.d.ts.map