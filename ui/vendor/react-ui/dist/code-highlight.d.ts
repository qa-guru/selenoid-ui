export type HighlightKind = 'shell' | 'json' | 'plain' | 'curl' | 'markdown';
export type HighlightOptions = {
    prefix?: string;
};
export declare function escapeHtml(value: string): string;
export declare function highlightJson(json: string, options?: HighlightOptions): string;
export declare function highlightShell(text: string, options?: HighlightOptions): string;
/**
 * Shell + JSON for curl via `-d '{…}'` (multiline ok). Falls back to plain shell.
 * Name kept for API stability.
 */
export declare function highlightCurlHeredoc(text: string, options?: HighlightOptions): string;
/**
 * Lightweight markdown for Agent prompts: headings, fenced JSON, inline
 * `code` / **bold**, list dashes. Same `.ch-tok-*` palette as shell/json.
 */
export declare function highlightMarkdown(text: string, options?: HighlightOptions): string;
export declare function trimOutputBlankLines(text: string): string;
export declare function highlightOutput(text: string, kind: HighlightKind): string;
/** Mount highlighted terminal output — always colored (`.ch-code` + tokens). */
export declare function mountHighlightedOutput(el: Element | null | undefined, text: string, kind?: HighlightKind): void;
//# sourceMappingURL=code-highlight.d.ts.map