import * as react from 'react';
import { HTMLAttributes, ReactNode, AnchorHTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'primary';
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    children: ReactNode;
}
declare function Badge({ variant, className, children, ...rest }: BadgeProps): react.JSX.Element;

type LangCode = 'en' | 'ru';
interface LangToggleProps {
    className?: string;
    testId?: string;
    labelTestId?: string;
    defaultLang?: LangCode;
    onLangChange?: (lang: LangCode) => void;
}
declare function LangIcon(): react.JSX.Element;
declare function LangToggle({ className, testId, labelTestId, defaultLang, onLangChange, }: LangToggleProps): react.JSX.Element;

type LinkVariant = 'default' | 'nav';
interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    variant?: LinkVariant;
    active?: boolean;
    children: ReactNode;
}
declare function Link({ variant, active, className, children, 'aria-current': ariaCurrent, ...rest }: LinkProps): react.JSX.Element;

/**
 * TypeScript mirror of the `HeaderConfig` JSDoc typedef in the design-system
 * SSOT (`projects/design-system-home/design-system/js/header.js`). `AppHeader`
 * assigns a value of this shape to `window.headerConfig` before header.js reads
 * it; keep these fields in sync with the vanilla contract.
 */
/** Mirror of `HeaderBrandLeadingConfig` in design-system `js/header.js`. */
interface HeaderBrandLeadingConfig {
    href?: string;
    label?: string;
}
interface HeaderBrandConfig {
    href?: string;
    /** Optional text brand (legacy consumers); header.js reads `leading` for the lockup. */
    label?: string;
    /** When set, header.js shows `[data-testid="header-brand-leading"]`. */
    leading?: HeaderBrandLeadingConfig;
}
interface HeaderNavItem {
    href: string;
    label: string;
    active?: boolean;
    testid?: string;
}
interface HeaderLangConfig {
    default?: 'ru' | 'en';
}
interface HeaderThemeConfig {
    default?: 'dark' | 'light';
}
interface HeaderConfig {
    brand?: HeaderBrandConfig;
    nav?: HeaderNavItem[];
    lang?: HeaderLangConfig;
    theme?: HeaderThemeConfig;
}
declare global {
    interface Window {
        headerConfig?: HeaderConfig;
    }
}

interface AppHeaderProps {
    /** Assigned to `window.headerConfig` before header.js mounts the markup. */
    config: HeaderConfig;
    /** Path to the canonical design-system header module (served by the host). */
    scriptSrc?: string;
    /** Id of the mount node header.js targets (`#app-header` by convention). */
    mountId?: string;
}
/**
 * Thin embed wrapper for the canonical design-system header. The header markup,
 * burger menu and nav behaviour stay SSOT in `js/header.js`
 * (`projects/design-system-home/design-system/`) — this component only renders
 * the `#app-header` mount node, publishes `window.headerConfig`, and injects the
 * header module script once. It deliberately does not re-implement the header
 * markup or vendor `header.css`; the host app provides those (via the
 * design-system embed / peer CSS: `tokens.css`, `header.css`, …).
 */
declare function AppHeader({ config, scriptSrc, mountId, }: AppHeaderProps): react.JSX.Element;

/** Consumer shorthand → primitive modifier (`status-tile--*`). */
type StatusTileStatus = 'ok' | 'stale' | 'error' | 'disconnected';
type StatusTileVariant = 'header' | 'tile';
type StatusTileModifier = 'connected' | 'stale' | 'error' | 'disconnected';
interface StatusTileProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    /** Upper label (e.g. `SSE`, `Selenoid`). */
    label: string;
    /** Visible state text (e.g. `Connected`, `Stale`). */
    state: string;
    /**
     * Maps to `status-tile--connected` / `--stale` / `--error` / `--disconnected`.
     * `ok` → `--connected`. Defaults to `ok`.
     */
    status?: StatusTileStatus;
    /** Layout shell: `header` (slot) or `tile` (dashboard). Defaults to `tile`. */
    variant?: StatusTileVariant;
    'data-testid'?: string;
}
declare function StatusTile({ label, state, status, variant, id, className, title, 'aria-label': ariaLabel, 'data-testid': dataTestId, ...rest }: StatusTileProps): react.JSX.Element;

type SelenoidMetricsVariant = 'header' | 'tile';
interface SelenoidMetricsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    /** Used capacity percent (shown with `%` unit). */
    usedPercent: number;
    queued: number;
    quotaUsed: number;
    quotaPending: number;
    quotaTotal: number;
    /** Layout shell: `header` (slot) or `tile` (dashboard). Defaults to `header`. */
    variant?: SelenoidMetricsVariant;
    'data-testid'?: string;
}
declare function SelenoidMetrics({ usedPercent, queued, quotaUsed, quotaPending, quotaTotal, variant, className, 'aria-label': ariaLabel, 'data-testid': dataTestId, ...rest }: SelenoidMetricsProps): react.JSX.Element;

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    block?: boolean;
    children: ReactNode;
}
declare function Button({ variant, block, className, children, type, ...rest }: ButtonProps): react.JSX.Element;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}
declare const Input: react.ForwardRefExoticComponent<InputProps & react.RefAttributes<HTMLInputElement>>;

type PanelVariant = 'content' | 'terminal';
type PanelTone = 'dark' | 'light';
/** `bottom` (default) — foot under body; `rail` — foot as right column (`.panel--foot-rail`). */
type PanelFootPlacement = 'bottom' | 'rail';
interface PanelAction {
    /** Icon glyph rendered inside the `icon-btn` (`.icon` slot). */
    icon: ReactNode;
    /** Accessible name for the icon-only button (`aria-label`). */
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    'data-testid'?: string;
}
interface PanelProps {
    /**
     * Bar title (`.panel__title`). Optional when `trail` carries the primary
     * chrome (e.g. terminal format tabs) — configurator / Capabilities pattern.
     */
    title?: ReactNode;
    children: ReactNode;
    /**
     * Chrome mode. `content` (default) → warm `panel--content` body shell;
     * `terminal` → dark `panel--terminal` (indicator dots, output actions).
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
     * Optional bar-end meta before actions (canonical `.panel__bar-end` — e.g.
     * vector hash badge). Sibling of `.panel__actions` (not a wrapper around them).
     */
    barEnd?: ReactNode;
    /**
     * Optional bar actions (canonical `panel__action icon-btn` cluster). Direct
     * child of `.panel__bar`. Content-driven wrap: `.panel__bar--wrap` keeps
     * dots + hash + actions on band 1 when tabs move to band 2;
     * `.panel__bar--wrap-meta` drops hash only when it bumps into dots.
     */
    actions?: PanelAction[];
    testId?: string;
    titleTestId?: string;
    bodyClassName?: string;
    hidden?: boolean;
    className?: string;
}
declare function Panel({ title, children, variant, tone, trail, foot, footPlacement, barEnd, actions, testId, titleTestId, bodyClassName, hidden, className, }: PanelProps): react.JSX.Element;

type PlaqueFieldLabelVariant = 'param' | 'caption';
interface PlaqueFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
    label: string;
    className?: string;
    divided?: boolean;
    stretch?: boolean;
    /** `data-param-id` for wiring / e2e. */
    paramId?: string;
    /**
     * `param` → `.plaque-field__label` (configurator ids: `name`, `remoteUrl`).
     * `caption` → `.plaque-field__text` (auth human captions: Login / Password).
     */
    labelVariant?: PlaqueFieldLabelVariant;
}
/**
 * Divided plaque with a text `input` control. Canon:
 * - param id + input → `templates/plaque-field.html` `plaque-field-text`
 * - human caption + input → `plaque-field-caption-input`
 * Thin wrapper — label / divider / control slots stay SSOT in `plaque-field.css`.
 */
declare function PlaqueField({ label, className, divided, stretch, paramId, labelVariant, id, ...inputProps }: PlaqueFieldProps): react.JSX.Element;

interface PlaqueSelectOption {
    /** Wire value (`<option value>`). */
    value: string;
    /** Visible caption. Defaults to `value`. */
    label?: ReactNode;
}
interface PlaqueSelectProps {
    /** Config param id / caption rendered in the left label slot. */
    label: string;
    /** Controlled selected value. */
    value?: string;
    /** Uncontrolled initial value. */
    defaultValue?: string;
    options: readonly PlaqueSelectOption[];
    /** Fired with the newly selected option value. */
    onChange?: (value: string) => void;
    /** `data-param-id` for wiring / e2e. */
    paramId?: string;
    disabled?: boolean;
    /** Fill the row (3-col grid) instead of content-hug (default true — canon `plaque-field-select`). */
    stretch?: boolean;
    id?: string;
    /** Accessible name; defaults to `label`. */
    'aria-label'?: string;
    className?: string;
    'data-testid'?: string;
}
/**
 * Divided plaque with a native `select` control (`select.plaque-field__control`).
 * Canon: `templates/plaque-field.html` → `plaque-field-select`. Thin wrapper —
 * the label / divider / control slots stay SSOT in `plaque-field.css`.
 */
declare function PlaqueSelect({ label, value, defaultValue, options, onChange, paramId, disabled, stretch, id, 'aria-label': ariaLabel, className, 'data-testid': testId, }: PlaqueSelectProps): react.JSX.Element;

interface PlaqueFieldSegOption {
    /** Wire value (mapped to `data-value`); active state compares against this. */
    value: string;
    /** Button caption. Defaults to `value`. */
    label?: ReactNode;
    /** Native `title` tooltip (long forms of short captions). */
    title?: string;
}
interface PlaqueFieldSegProps {
    /** Config param id / caption rendered in the left label slot. */
    label: string;
    /**
     * Exactly two options for a 2-opt segmented control. Defaults to the boolean
     * `true` / `false` canon (skill `configurator-boolean`).
     */
    options?: readonly [PlaqueFieldSegOption, PlaqueFieldSegOption];
    /** Controlled selected value. */
    value?: string;
    /** Uncontrolled initial value (defaults to the first option). */
    defaultValue?: string;
    /** Fired with the newly selected option value. */
    onValueChange?: (value: string) => void;
    /** `data-param-id` for wiring / e2e (`syncControlButtons`). */
    paramId?: string;
    /** Accessible group name; defaults to `label`. */
    'aria-label'?: string;
    className?: string;
    'data-testid'?: string;
}
/**
 * 2-opt segmented control inside a divided plaque (`plaque-field-seg-track--many`).
 * Canon for any two-value field, including boolean `true` / `false`
 * (skill `configurator-boolean`) — buttons are a `radiogroup`, never a native
 * checkbox. Shell full-width; chips content-hug + flex-end — no `--stretch`
 * class (that class stretches select/input controls only).
 */
declare function PlaqueFieldSeg({ label, options, value, defaultValue, onValueChange, paramId, 'aria-label': ariaLabel, className, 'data-testid': testId, }: PlaqueFieldSegProps): react.JSX.Element;

interface PlaqueTagstripOption {
    /** Wire value (mapped to `data-value`); membership compares against this. */
    value: string;
    /** Button caption. Defaults to `value`. */
    label?: ReactNode;
    /** Native `title` tooltip. */
    title?: string;
}
interface PlaqueTagstripProps {
    /** Config param id / caption rendered in the left label slot. */
    label: string;
    options: readonly PlaqueTagstripOption[];
    /** Currently selected values (multi-select). */
    values: readonly string[];
    /** Fired with the toggled option value (add if absent, remove if present). */
    onToggle: (value: string) => void;
    /** `data-param-id` for wiring / e2e. */
    paramId?: string;
    /** Accessible group name; defaults to `label`. */
    'aria-label'?: string;
    className?: string;
    'data-testid'?: string;
}
/**
 * Multi-select tag row inside a divided plaque (`plaque-field-seg-track--many`).
 * Canon: driver `images` row — pill buttons with per-button `aria-pressed`
 * (`role="group"`, **not** a radiogroup and **not** a native checkbox — that is
 * `plaque-field-checkstrip`). Thin wrapper; slots stay SSOT in `plaque-field-seg.css`.
 */
declare function PlaqueTagstrip({ label, options, values, onToggle, paramId, 'aria-label': ariaLabel, className, 'data-testid': testId, }: PlaqueTagstripProps): react.JSX.Element;

interface PlaqueFieldSegGridProps {
    /** Grid cells — typically `PlaqueFieldSeg` fields. */
    children: ReactNode;
    /**
     * Remote-hub canon (`--mixed --pair`): max 2 per row, content-hug, no ellipsis
     * (skill `configurator-boolean`; 3 flags → 2 + 1). Off by default → dense
     * container-query grid (1 → 2 → 3 cols).
     */
    pair?: boolean;
    /** Wrap each child in `.plaque-field-grid__cell` (default true). */
    wrapCells?: boolean;
    /**
     * Mount the canonical magnet script to align dividers. Embed only — see
     * `usePlaqueFieldMagnet`. No effect on `--pair` (the magnet skips it).
     */
    magnet?: boolean;
    /** Magnet module path forwarded to `usePlaqueFieldMagnet`. */
    magnetScriptSrc?: string;
    /** Accessible group name for the batch. */
    'aria-label'?: string;
    className?: string;
    'data-testid'?: string;
}
/**
 * Dense grid of plaque-field seg cells. Thin wrapper over `.plaque-field-grid`:
 * maps children into `.plaque-field-grid__cell` slots and toggles the remote-hub
 * `--pair` canon. Divider alignment for stack layouts is delegated to the
 * embedded magnet (`magnet` → `usePlaqueFieldMagnet`), never re-implemented here.
 */
declare function PlaqueFieldSegGrid({ children, pair, wrapCells, magnet, magnetScriptSrc, 'aria-label': ariaLabel, className, 'data-testid': testId, }: PlaqueFieldSegGridProps): react.JSX.Element;

type PlaqueFieldGridLayout = 'pair' | 'duo' | 'solo';
type PlaqueFieldGridCellSpan = 'sm' | 'md' | 'lg' | 'full';
interface PlaqueFieldGridProps {
    /** Grid cells — any plaque fields (`PlaqueSelect`, `PlaqueFieldSeg`, `PlaqueTagstrip`, …). */
    children: ReactNode;
    /**
     * Row layout on the mixed 12-col grid (`configurator-option-presets#driver`):
     * `duo` (2 equal, default) · `solo` (1 full-width) · `pair` (remote-hub batch,
     * max 2/row content-hug).
     */
    layout?: PlaqueFieldGridLayout;
    /**
     * Span class on every wrapped cell (`__cell--sm|md|lg|full`). On mixed 12-col
     * rows `lg` also unlocks `--plaque-label-width-wide` (long param ids).
     * Ignored when `wrapCells` is false.
     */
    cellSpan?: PlaqueFieldGridCellSpan;
    /** Wrap each child in `.plaque-field-grid__cell` (default true). */
    wrapCells?: boolean;
    /**
     * Wrap the grid in a `.plaque-field-grid-stack--magnet` container and mount the
     * canonical magnet so label/divider columns align across sibling rows. Embed
     * only — see `usePlaqueFieldMagnet`.
     */
    stackMagnet?: boolean;
    /** Magnet module path forwarded to `usePlaqueFieldMagnet`. */
    magnetScriptSrc?: string;
    /** Accessible group name for the row. */
    'aria-label'?: string;
    className?: string;
    'data-testid'?: string;
}
/**
 * Configurator row grid. Thin wrapper over `.plaque-field-grid--mixed`: maps
 * children into `.plaque-field-grid__cell` slots and selects the row layout
 * (`--duo` / `--solo` / `--pair`). Unlike `PlaqueFieldSegGrid` the cells may be
 * any plaque field. Divider alignment across rows is delegated to the embedded
 * magnet (`stackMagnet` → `usePlaqueFieldMagnet`), never re-implemented here.
 */
declare function PlaqueFieldGrid({ children, layout, cellSpan, wrapCells, stackMagnet, magnetScriptSrc, 'aria-label': ariaLabel, className, 'data-testid': testId, }: PlaqueFieldGridProps): react.JSX.Element;

declare global {
    interface Window {
        /** Published by the canonical design-system `js/plaque-field-magnet.js`. */
        syncPlaqueMagnetStacks?: (root?: ParentNode) => void;
    }
}
interface UsePlaqueFieldMagnetOptions {
    /** Skip mounting/re-syncing when false (e.g. content-hug `--pair` grids). */
    enabled?: boolean;
    /** Path to the canonical magnet module served by the host. */
    scriptSrc?: string;
    /**
     * Re-run `syncPlaqueMagnetStacks` when this value changes — pass a signal that
     * tracks the rendered fields (e.g. cell count) so dynamically added/removed
     * rows realign. The magnet self-inits on mount/resize only.
     */
    syncKey?: unknown;
}
/**
 * Embed hook for the canonical plaque-field magnet. The divider-alignment logic
 * (measure label / control, cap columns, ResizeObserver) stays SSOT in
 * `js/plaque-field-magnet.js` (`projects/design-system-home/design-system/`) —
 * this hook only injects the script once and re-runs `syncPlaqueMagnetStacks`
 * after mount. It deliberately does **not** re-implement the measurement in
 * React. Note the magnet intentionally skips `.plaque-field-grid--pair`
 * (content-hug), so it only affects `plaque-field-grid-stack` /
 * `plaque-field-panel-stack` layouts.
 */
declare function usePlaqueFieldMagnet({ enabled, scriptSrc, syncKey, }?: UsePlaqueFieldMagnetOptions): void;

interface ThemeToggleProps {
    className?: string;
    testId?: string;
    storageKey?: string;
}
declare function ThemeToggle({ className, testId, storageKey, }: ThemeToggleProps): react.JSX.Element;

declare function ThemeIconSun(): react.JSX.Element;
declare function ThemeIconMoon(): react.JSX.Element;

/** Panel bar reset — 16×16, stroke 1.5 (pair with copy/download; templates/icon-reset.html). */
declare function IconReset(): react.JSX.Element;
/** Panel bar copy — 16×16, stroke 1.5 (pair with reset/download; templates/icon-copy.html). */
declare function IconCopy(): react.JSX.Element;
/** Panel bar download — tray A, 16×16, stroke 1.5 (templates/icon-download.html). */
declare function IconDownload(): react.JSX.Element;

type HighlightKind = 'shell' | 'json' | 'plain' | 'curl' | 'markdown';
type HighlightOptions = {
    prefix?: string;
};
declare function escapeHtml(value: string): string;
declare function highlightJson(json: string, options?: HighlightOptions): string;
declare function highlightShell(text: string, options?: HighlightOptions): string;
/**
 * Shell + JSON for curl via `-d '{…}'` (multiline ok). Falls back to plain shell.
 * Name kept for API stability.
 */
declare function highlightCurlHeredoc(text: string, options?: HighlightOptions): string;
/**
 * Lightweight markdown for Agent prompts: headings, fenced JSON, inline
 * `code` / **bold**, list dashes. Same `.ch-tok-*` palette as shell/json.
 */
declare function highlightMarkdown(text: string, options?: HighlightOptions): string;
declare function highlightOutput(text: string, kind: HighlightKind): string;

export { AppHeader, type AppHeaderProps, Badge, type BadgeProps, type BadgeVariant, Button, type ButtonProps, type ButtonVariant, type HeaderBrandConfig, type HeaderBrandLeadingConfig, type HeaderConfig, type HeaderLangConfig, type HeaderNavItem, type HeaderThemeConfig, type HighlightKind, type HighlightOptions, IconCopy, IconDownload, IconReset, Input, type InputProps, type LangCode, LangIcon, LangToggle, type LangToggleProps, Link, type LinkProps, type LinkVariant, Panel, type PanelAction, type PanelProps, type PanelTone, type PanelVariant, PlaqueField, PlaqueFieldGrid, type PlaqueFieldGridLayout, type PlaqueFieldGridProps, type PlaqueFieldLabelVariant, type PlaqueFieldProps, PlaqueFieldSeg, PlaqueFieldSegGrid, type PlaqueFieldSegGridProps, type PlaqueFieldSegOption, type PlaqueFieldSegProps, PlaqueSelect, type PlaqueSelectOption, type PlaqueSelectProps, PlaqueTagstrip, type PlaqueTagstripOption, type PlaqueTagstripProps, SelenoidMetrics, type SelenoidMetricsProps, type SelenoidMetricsVariant, StatusTile, type StatusTileModifier, type StatusTileProps, type StatusTileStatus, type StatusTileVariant, ThemeIconMoon, ThemeIconSun, ThemeToggle, type ThemeToggleProps, type UsePlaqueFieldMagnetOptions, escapeHtml, highlightCurlHeredoc, highlightJson, highlightMarkdown, highlightOutput, highlightShell, usePlaqueFieldMagnet };
