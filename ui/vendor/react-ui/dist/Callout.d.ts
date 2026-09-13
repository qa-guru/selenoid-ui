import type { HTMLAttributes, ReactNode } from 'react';
export type CalloutTone = 'warning' | 'success';
export interface CalloutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    /** Colour family → `.callout--warning` / `.callout--success`. */
    tone: CalloutTone;
    /** Visible heading → `p.callout__title`. */
    title?: ReactNode;
    /** List items (`<li>…</li>`), wrapped in `ul.callout__list`. */
    children?: ReactNode;
}
/**
 * Warning / success block (`div.callout` + `--warning` / `--success`).
 * Thin wrapper — markup SSOT: `design-system/templates/callout.html` /
 * `css/callout.css`. Catalog: `preview/chrome.html#section-callout`.
 * Empty root is CSS-hidden (`:empty`). Not `Badge`, `Status`, `StatusTile`,
 * `Indicator`, `Panel`.
 */
export declare function Callout({ tone, title, className, role, children, ...rest }: CalloutProps): import("react").JSX.Element;
//# sourceMappingURL=Callout.d.ts.map