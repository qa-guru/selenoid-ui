import type { ElementType, ReactNode } from 'react';
export type PanelVariant = 'content' | 'terminal';
export type PanelTone = 'dark' | 'light';
/** `bottom` (default) — foot under body; `rail` — foot as right column (`.panel--foot-rail`). */
export type PanelFootPlacement = 'bottom' | 'rail';
/**
 * Terminal / panel bar action — **icon-only** canon.
 * Renders as `.icon-btn.panel__action` (no visible text, no bordered `.btn`).
 * `label` is a11y-only (`aria-label` + `title`). Glyphs: `IconReset` /
 * `IconDownload` / `IconCopy` (`panel-icons.tsx` ↔ `templates/icon-*.html`).
 */
export interface PanelAction {
    /** Icon glyph rendered inside the `icon-btn` (`.icon` slot). */
    icon: ReactNode;
    /** Accessible name for the icon-only button (`aria-label` + `title`). Not rendered as text. */
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    'data-testid'?: string;
    /** Render as another element — e.g. a router `Link`. Defaults to `button`. */
    as?: ElementType;
    /** Native href when `as="a"`. */
    href?: string;
    /** Router `to` when `as` is a Link. */
    to?: string | {
        pathname: string;
        search?: string;
    };
}
export interface PanelProps {
    /**
     * Bar title (`.panel__title`). Optional when `trail` carries the primary
     * chrome (e.g. terminal format tabs) — configurator / Capabilities pattern.
     */
    title?: ReactNode;
    children: ReactNode;
    /**
     * Chrome mode. `content` (default) → warm `panel--content` body shell;
     * `terminal` → dark `panel--terminal` (indicator dots, output actions).
     * Terminal children should be `.panel__code.ch-code` + highlighted HTML
     * (`highlightOutput` / RAG `cfg-terminal-highlight`); body pad is zeroed in CSS.
     */
    variant?: PanelVariant;
    /**
     * Terminal output tone. Only applies when `variant="terminal"`.
     * `dark` (default) → `#1a1917`; `light` → `panel--terminal-light` paper.
     * Independent of `html.theme-light`.
     */
    tone?: PanelTone;
    /**
     * Optional content inside `.panel__trail` after the title — canonical slot for
     * terminal format tabs (`.tabs` / `.tab` / `.tab--active`) in the bar.
     */
    trail?: ReactNode;
    /**
     * Optional footer (`.panel__foot`) — e.g. language tabs. Placement via
     * `footPlacement` (`bottom` under body, or `rail` as a right column).
     */
    foot?: ReactNode;
    /**
     * Where to render `foot`. `bottom` (default) → under body; `rail` →
     * `.panel--foot-rail` (tabs top→bottom on the right, ≥769px).
     */
    footPlacement?: PanelFootPlacement;
    /**
     * Optional bar-end meta before actions (canonical `.panel__bar-end` —
     * editable `vector#` fingerprint). Sibling of `.panel__actions` (not a
     * wrapper around them).
     */
    barEnd?: ReactNode;
    /**
     * Optional bar actions — **icon-only** `panel__action icon-btn` cluster
     * in order **Reset → Download → Copy** (no text labels, no bordered `.btn`).
     * Direct child of `.panel__bar`. Prefer `IconReset` / `IconDownload` /
     * `IconCopy` (`panel-icons.tsx` ↔ `templates/icon-*.html`).
     * Content-driven wrap: `.panel__bar--wrap` keeps dots + hash + actions on
     * band 1 when tabs move to band 2; `.panel__bar--wrap-meta` drops hash only
     * when it bumps into dots.
     */
    actions?: PanelAction[];
    testId?: string;
    titleTestId?: string;
    bodyClassName?: string;
    hidden?: boolean;
    className?: string;
}
export declare function Panel({ title, children, variant, tone, trail, foot, footPlacement, barEnd, actions, testId, titleTestId, bodyClassName, hidden, className, }: PanelProps): import("react").JSX.Element;
//# sourceMappingURL=Panel.d.ts.map