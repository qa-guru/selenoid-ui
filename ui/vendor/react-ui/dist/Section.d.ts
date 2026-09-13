import type { HTMLAttributes, ReactNode } from 'react';
export type SectionTitleAs = 'h2' | 'h3';
export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
    /** Visible heading → `h2.section__title` (catalog sticky → `h3`). */
    title?: ReactNode;
    /** Optional lead → `p.section__desc`. Empty / omitted → no node. */
    description?: ReactNode;
    /** Sticky aside → `.section--sticky` (CSS in `sticky.css` via `section.css`; not JS). */
    sticky?: boolean;
    /** Heading tag. Default `h2`; catalog sticky panel uses `h3`. */
    titleAs?: SectionTitleAs;
    children?: ReactNode;
}
/**
 * Layout block (`section.section`). Thin wrapper — markup SSOT:
 * `design-system/templates/section.html` / `css/section.css`.
 * Catalog: `preview/chrome.html#section-section`.
 * Sticky is `.section--sticky` (CSS primitive, ≥769px) — not JS, not `Panel`.
 * Not `Grid`, `Stack`, `FieldCaption`, `Label`, `Text`, `PlaqueFieldGrid`,
 * `plaque-field-grid-stack`.
 */
export declare function Section({ title, description, sticky, titleAs, className, children, ...rest }: SectionProps): import("react").JSX.Element;
//# sourceMappingURL=Section.d.ts.map