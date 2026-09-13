import type { ImgHTMLAttributes } from 'react';
export type AllureLogoVariant = 'allure-1' | 'allure-2' | 'allure-3' | 'allure-testops' | 'testops-ru';
export interface AllureLogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'children'> {
    /** Catalog mark → `.allure-logo--{variant}`. */
    variant: AllureLogoVariant;
    /** Host-served asset URL. The library does not vendor Allure SVG. */
    src: string;
}
/**
 * Official Allure / TestOps mark (`img.allure-logo`). Thin wrapper —
 * markup SSOT: `design-system/templates/allure-logo.html` /
 * `css/allure-logo.css`. Catalog: `preview/chrome.html#section-allure-logo`.
 * Height `--allure-logo-height` (default `32px`); width auto; `object-fit:
 * contain`. Allure 1 HTML fallback width `36`, others `32`. Not `QaGuruLogo`,
 * `BrandLogo`, `Badge`, `Status`, `StatusTile`, `Indicator`, `Callout`, `Panel`.
 */
export declare function AllureLogo({ variant, src, className, alt, width, height, ...rest }: AllureLogoProps): import("react").JSX.Element;
//# sourceMappingURL=AllureLogo.d.ts.map