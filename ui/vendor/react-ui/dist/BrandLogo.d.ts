import type { AnchorHTMLAttributes, HTMLAttributes } from 'react';
export interface BrandLogoProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'href'> {
    /** Present → `<a class="brand-logo-link">`; omit → `<span>` (catalog endorsed). */
    href?: string;
    /** Stack `by qa.guru` under the wordmark → `.brand-logo--endorsed`. */
    endorsed?: boolean;
    /** Lockup size → `--brand-logo-size`. CSS default `20px`. Catalog endorsed `34`. */
    size?: number;
    /** Wordmark. Default `Selenoid`. */
    word?: string;
    /** Version accent inside the wordmark. Default `3`. */
    ver?: string;
}
export interface BrandAttributionProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
    /** Standalone catalog size (`12px`). Nested composition leaves CSS `0.36em`. */
    size?: number;
}
/**
 * Selenoid lockup (`.brand-logo` / `.brand-logo-link`). Thin wrapper —
 * markup SSOT: `design-system/templates/brand-logo.html` /
 * `css/brand-logo.css`. Catalog: `preview/chrome.html#section-brand-logo`.
 * Inline nested-square `svg.brand-logo__mark` (not `header__brand-logo`,
 * not `img`, not a vendor asset). Size `--brand-logo-size` (default `20px`).
 * Default `data-testid` `brand-logo` (template + catalog plain); endorsed
 * composition has none. `href` → `<a>`, otherwise `<span>`. Not `QaGuruLogo`,
 * `AllureLogo`, `AppHeader`, `Badge`, `Status`, `StatusTile`, `Indicator`,
 * `Callout`, `Panel`.
 */
export declare function BrandLogo({ href, endorsed, size, word, ver, className, style, 'aria-label': ariaLabel, ...rest }: BrandLogoProps): import("react").JSX.Element;
/**
 * Reusable `by qa.guru` byline (`span.brand-attribution`). Catalog standalone
 * uses `size={12}` (`font-size: 12px`). Nested under endorsed `BrandLogo`
 * copy is `aria-hidden` on the parent — this companion is labeled
 * `by qa.guru` and has no default `data-testid`.
 */
export declare function BrandAttribution({ size, className, style, 'aria-label': ariaLabel, ...rest }: BrandAttributionProps): import("react").JSX.Element;
//# sourceMappingURL=BrandLogo.d.ts.map