import type { HTMLAttributes, ReactNode } from 'react';
export interface IconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
    /** Glyph node (SVG). Sized by `.icon` (`--icon-size-md`, 18×18). */
    children: ReactNode;
}
/**
 * Glyph slot (`span.icon` + SVG). Thin wrapper — markup SSOT:
 * `design-system/templates/icon.html` / `css/icon.css`.
 * Catalog: `preview/primitives.html#section-icon`.
 * Always `aria-hidden`. No modifiers. SVG has no `width`/`height`.
 * Not `IconBtn`, not `Badge` / `Chip` / `Status`.
 */
export declare function Icon({ className, children, ...rest }: IconProps): import("react").JSX.Element;
//# sourceMappingURL=Icon.d.ts.map