import type { HTMLAttributes } from 'react';
import { type StabilityHistoryPoint, type StabilityLang } from './StabilityCell';
export type { StabilityHistoryPoint };
export type TestsTableLang = StabilityLang;
export interface TestsTableRow {
    name: string;
    status: string;
    history: readonly StabilityHistoryPoint[];
    flakyFlips?: number;
    durationSec: number;
    durationFill: number;
}
export interface TestsTableProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    rows: readonly TestsTableRow[];
    /** Status + StabilityCell copy. Default `ru`. */
    lang?: TestsTableLang;
}
/**
 * Tests table (`div.tests-table-wrap` > `table.tests-table`).
 * Thin wrapper — markup SSOT: `design-system/templates/tests-table.html` /
 * `css/tests-table.css`. Catalog: `preview/widgets.html#section-tests-table`
 * (`tests-table-demo`, 3 rows). Template: 2 rows, wrap without extra testid.
 * Columns Test / Status / Stability / Duration — **not** Trend. Status is
 * `span.badge.badge--status-{status}` via `stabilityStatusLabel` (not library
 * `Badge`). Stability composes `StabilityCell` (not a raw `div.stability-cell`).
 * Duration: `div.duration-bar` + `__value` + `__track` +
 * `span.duration-bar__fill.duration-bar__fill--{status}` (`width` %). Table
 * `min-width: 52rem`, wrap `overflow-x`, `font-size: var(--font-size-sm)`,
 * track `6px`. Default `lang` `ru`. Not tests-table-panel / adaptive /
 * `@container`, not Sparkline (trend is panel), not QG / `qg-info`, not
 * WidgetTile / WidgetMosaic / ChartTile / CodeHighlight, not toolbar / sort /
 * pagination / filters.
 */
export declare function TestsTable({ rows, lang, className, ...rest }: TestsTableProps): import("react").JSX.Element;
//# sourceMappingURL=TestsTable.d.ts.map