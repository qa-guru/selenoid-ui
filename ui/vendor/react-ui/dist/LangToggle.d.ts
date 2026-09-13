export type LangCode = 'en' | 'ru';
/** Mirror of `HEADER_LANG_CHANGE` in design-system `js/header.js`. */
export declare const HEADER_LANG_CHANGE = "header:lang-change";
/** Mirror of `LANG_STORAGE_KEY` in design-system `js/header.js`. */
export declare const LANG_STORAGE_KEY = "zds-lang";
export interface LangToggleProps {
    className?: string;
    testId?: string;
    labelTestId?: string;
    defaultLang?: LangCode;
    storageKey?: string;
    onLangChange?: (lang: LangCode) => void;
}
export declare function LangIcon(): import("react").JSX.Element;
export declare function LangToggle({ className, testId, labelTestId, defaultLang, storageKey, onLangChange, }: LangToggleProps): import("react").JSX.Element;
//# sourceMappingURL=LangToggle.d.ts.map