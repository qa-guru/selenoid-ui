import type { HTMLAttributes } from 'react';
import { sparklineThemeFromSite, stabilityStatusLabel, type SparklineTheme, type StabilityHistoryPoint, type StabilityLang } from './stability-cell-canon.js';
export type { SparklineTheme, StabilityHistoryPoint, StabilityLang };
export { sparklineThemeFromSite, stabilityStatusLabel };
export interface StabilityCellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    /** Run statuses → `history[].status`. Empty → «—». */
    history: readonly StabilityHistoryPoint[];
    /** Flaky flip count. Default `0` (no `.badge--flaky`). */
    flakyFlips?: number;
    /** Palette from `sparklineThemeFromSite`. Omit → site light/dark. */
    theme?: SparklineTheme;
    /** Dot titles + flaky title. Default `ru` («Флипы flaky»). */
    lang?: StabilityLang;
    /** Last N runs. Default `10`. */
    limit?: number;
}
/**
 * Status-dot cell (`div.stability-cell` + `span.stability-dots`).
 * Thin wrapper — markup SSOT: `design-system/templates/stability-cell.html` /
 * `css/stability-cell.css`. Embed SSOT: `buildStabilityCell` /
 * `stabilityStatusLabel` in `js/stability-cell.js` (embed, not a rewrite;
 * colors from `statusSparkColor` / `sparklineThemeFromSite` in
 * `js/sparkline.js`). Catalog: `preview/widgets.html#section-stability-cell`
 * (`stability-cell-empty` / `-stable` / `-flaky`; template `stability-cell`;
 * not `sparkline-demo-stability`). Default `lang` `ru`, `limit` `10`,
 * `flakyFlips` `0`. Dots 7×7, gap `3px`. Not Highcharts / nivo, not library
 * `Badge` instead of `span.badge.badge--flaky`, not Sparkline / tests-table /
 * QG / WidgetTile.
 */
export declare function StabilityCell({ history, flakyFlips, theme, lang, limit, className, ...rest }: StabilityCellProps): import("react").JSX.Element;
//# sourceMappingURL=StabilityCell.d.ts.map