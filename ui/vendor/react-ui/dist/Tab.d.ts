import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}
/**
 * Tab list (`.tabs`). Pair with `Tab`. Markup SSOT:
 * `design-system/templates/tab.html` / `css/tab.css`.
 */
export declare function Tabs({ className, children, role, ...rest }: TabsProps): import("react").JSX.Element;
export interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Selected state → `.tab--active` + `aria-selected`. */
    active?: boolean;
    children: ReactNode;
}
/**
 * Tab trigger (`.tab` / `.tab--active`). Thin wrapper — no keyboard roving
 * tabindex; host owns selection (configurator terminal / Capabilities).
 */
export declare function Tab({ active, className, type, children, role, 'aria-selected': ariaSelected, ...rest }: TabProps): import("react").JSX.Element;
//# sourceMappingURL=Tab.d.ts.map