/** Mirror of `HEADER_THEME_CHANGE` in design-system `js/header.js`. */
export declare const HEADER_THEME_CHANGE = "header:theme-change";
/** Mirror of `THEME_STORAGE_KEY` in design-system `js/header.js`. */
export declare const THEME_STORAGE_KEY = "zds-theme";
export type ThemeCode = 'light' | 'dark';
export interface ThemeToggleProps {
    className?: string;
    testId?: string;
    storageKey?: string;
}
export declare function ThemeToggle({ className, testId, storageKey, }: ThemeToggleProps): import("react").JSX.Element;
//# sourceMappingURL=ThemeToggle.d.ts.map