import type { SelectHTMLAttributes } from 'react';
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    className?: string;
}
/**
 * Native `<select class="select">`. Thin wrapper —
 * markup SSOT: `design-system/templates/select.html` / `css/select.css`.
 * Catalog: `preview/primitives.html#section-select`.
 * Not `PlaqueSelect` (`select.plaque-field__control`).
 */
export declare const Select: import("react").ForwardRefExoticComponent<SelectProps & import("react").RefAttributes<HTMLSelectElement>>;
//# sourceMappingURL=Select.d.ts.map