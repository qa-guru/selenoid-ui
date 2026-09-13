import type { HTMLAttributes } from 'react';
import { type HighlightKind } from './code-highlight';
export interface CodeHighlightProps extends Omit<HTMLAttributes<HTMLPreElement>, 'children'> {
    /** Source text → `highlightOutput` (trimmed; always escaped / token HTML). */
    code: string;
    /** Highlighter route. Default `json` (catalog / template). */
    kind?: HighlightKind;
    /** Uncolored fallback → `.ch-code--plain` + `kind: 'plain'`. */
    plain?: boolean;
}
/**
 * Highlighted `<pre class="ch-code">`. Thin wrapper — markup SSOT:
 * `design-system/templates/code-highlight.html` / `css/code-highlight.css`.
 * Catalog: `preview/widgets.html#section-code-highlight`.
 * Tokens come from `highlightOutput` (`code-highlight.ts`) — not Prism,
 * not a TS rewrite of `js/code-highlight.js`. Compose terminal chrome with
 * existing `Panel` `variant="terminal"` + `className="panel__code"`
 * (`.panel__code.ch-code`; theme on the panel, e.g. `ch-theme--vscode`).
 * Not sparkline / QG / WidgetTile.
 */
export declare function CodeHighlight({ code, kind, plain, className, ...rest }: CodeHighlightProps): import("react").JSX.Element;
//# sourceMappingURL=CodeHighlight.d.ts.map