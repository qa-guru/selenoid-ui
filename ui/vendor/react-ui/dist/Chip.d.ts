import type { ButtonHTMLAttributes, ReactNode } from 'react';
export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Selected look → `.chip--active`. */
    active?: boolean;
    /**
     * Non-interactive label → `<span class="chip chip--static">`.
     * Catalog static example also sets `active` (`chip--active chip--static`).
     */
    static?: boolean;
    children: ReactNode;
}
/**
 * Interactive label (`.chip` / `.chip--active` / `.chip--static`). Thin wrapper —
 * markup SSOT: `design-system/templates/chip.html` / `css/chip.css`.
 * Catalog: `preview/primitives.html#section-chip`.
 */
export declare function Chip({ active, static: isStatic, className, type, disabled, children, ...rest }: ChipProps): import("react").JSX.Element;
//# sourceMappingURL=Chip.d.ts.map