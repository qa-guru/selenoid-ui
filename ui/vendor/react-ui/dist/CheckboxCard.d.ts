import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
export interface CheckboxGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    /** Catalog heading — `h3.checkbox-group__title`. */
    title?: ReactNode;
    children: ReactNode;
}
/**
 * Checkbox-card group (`.checkbox-group` + `h3.checkbox-group__title` + `.stack.stack--sm`).
 * Thin wrapper — markup SSOT: `design-system/templates/checkbox-card.html` / `css/choice-card.css`.
 * Catalog: `preview/fields.html#section-checkbox-card`. Pair with `CheckboxCard`; cards share `name` (multi-select).
 */
export declare function CheckboxGroup({ title, className, children, ...rest }: CheckboxGroupProps): import("react").JSX.Element;
export interface CheckboxCardProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    children: ReactNode;
    /** Catalog modifier → `.checkbox-card--muted`. Visual only; not `disabled`. */
    muted?: boolean;
    /** Catalog puts `data-testid` on the `<label class="checkbox-card">`, not the input. */
    'data-testid'?: string;
    /** Catalog input id, e.g. `checkbox-card-input-a`. */
    inputTestId?: string;
}
/**
 * Checkbox card (`label.checkbox-card` + `input.checkbox__input` + `.checkbox-card__body`).
 * Thin wrapper — markup SSOT: `design-system/templates/checkbox-card.html` / `css/choice-card.css`.
 * Input chrome stays `checkbox.css` (`.checkbox__input`). Catalog: `preview/fields.html#section-checkbox-card`.
 * Group via shared `name` (multi-select). Not native `Checkbox`, not `Radio` / `radio-card`,
 * not `.plaque-field-check`, not `PlaqueFieldSeg`.
 */
export declare const CheckboxCard: import("react").ForwardRefExoticComponent<CheckboxCardProps & import("react").RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=CheckboxCard.d.ts.map