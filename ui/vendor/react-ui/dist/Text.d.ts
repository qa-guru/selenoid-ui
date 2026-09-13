import type { HTMLAttributes, ReactNode } from 'react';
export type TextAs = 'p' | 'span';
export interface TextProps extends HTMLAttributes<HTMLElement> {
    /** Muted colour → `.text--muted`. */
    muted?: boolean;
    /** Small size → `.text--sm`. */
    sm?: boolean;
    /** Root tag. Default `p`; template inline → `span`. */
    as?: TextAs;
    children: ReactNode;
}
/**
 * Static copy (`p.text` / `span.text`). Thin wrapper — markup SSOT:
 * `design-system/templates/text.html` / `css/text.css`.
 * Catalog: `preview/primitives.html#section-text`.
 * `muted` → `.text--muted`; `sm` → `.text--sm`; `as="span"` → `<span class="text">`.
 * Not `Label`, `FieldCaption`, `Link`, `Badge`, `Status`.
 */
export declare function Text({ muted, sm, as, className, children, ...rest }: TextProps): import("react").JSX.Element;
//# sourceMappingURL=Text.d.ts.map