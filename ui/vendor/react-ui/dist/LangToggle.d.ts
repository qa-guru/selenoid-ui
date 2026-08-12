export type LangCode = 'en' | 'ru';
export interface LangToggleProps {
    className?: string;
    testId?: string;
    labelTestId?: string;
    defaultLang?: LangCode;
    onLangChange?: (lang: LangCode) => void;
}
export declare function LangIcon(): import("react").JSX.Element;
export declare function LangToggle({ className, testId, labelTestId, defaultLang, onLangChange, }: LangToggleProps): import("react").JSX.Element;
//# sourceMappingURL=LangToggle.d.ts.map