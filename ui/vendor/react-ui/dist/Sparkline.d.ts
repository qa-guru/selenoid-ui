import type { HTMLAttributes } from 'react';
import { sparklineThemeFromSite, type SparklineHistoryPoint, type SparklineLang, type SparklineTheme } from './sparkline-canon.js';
export type { SparklineHistoryPoint, SparklineLang, SparklineTheme };
export { sparklineThemeFromSite };
export interface SparklineProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
    /** Run durations → `history[].durationSec`. Fewer than 2 numbers → empty. */
    history: readonly SparklineHistoryPoint[];
    /** Palette from `sparklineThemeFromSite`. Omit → site light/dark. */
    theme?: SparklineTheme;
    /** Empty copy. Default `ru` («Нет истории»). */
    lang?: SparklineLang;
    /** SVG width. Default `88`. */
    width?: number;
    /** SVG height. Default `28`. */
    height?: number;
}
/**
 * Duration trend cell (`span.sparkline--empty` / `svg.sparkline--duration`).
 * Thin wrapper — markup SSOT: `design-system/templates/sparkline.html` /
 * `css/sparkline.css`. Geometry SSOT: `buildSparkline` /
 * `sparklineThemeFromSite` in `js/sparkline.js` (embed, not a rewrite).
 * Catalog: `preview/widgets.html#section-sparkline` (`sparkline-demo-empty` /
 * `-sparse` / `-dense`; not `-stability`). Default 88×28, `lang` `ru`.
 * Not Highcharts / nivo, not `stability-cell` / tests-table / QG / WidgetTile.
 */
export declare function Sparkline({ history, theme, lang, width, height, className, ...rest }: SparklineProps): import("react").JSX.Element;
//# sourceMappingURL=Sparkline.d.ts.map