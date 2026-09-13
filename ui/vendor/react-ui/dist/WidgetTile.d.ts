import type { HTMLAttributes, ReactNode } from 'react';
/** Status-family suffix → `.indicator--status-*` (catalog / mocks `dots`). */
export type WidgetTileDot = 'red' | 'orange' | 'yellow' | 'purple' | 'gray' | 'green' | 'blue';
export type WidgetTileTier = 'hero' | 'regular' | 'compact' | 'micro';
/** Body aspect `--layout-WxH` or mosaic `--span-WxH` (`W,H ∈ 1..4`). Class map only. */
export type WidgetTileLayout = `${1 | 2 | 3 | 4}x${1 | 2 | 3 | 4}`;
export interface WidgetTileProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
    /** Visible bar heading → `span.widget-tile__title`. */
    title: ReactNode;
    /** Chart host → `div.widget-tile__body`. Empty is a valid mount slot. */
    children?: ReactNode;
    /** Chart type → `data-chart` (template `currentStatus`). */
    chart?: string;
    /** Status-family dots in the bar (`Indicator` + `IndicatorRow`). */
    dots?: readonly WidgetTileDot[];
    /** Edge-to-edge body → `.widget-tile--bleed` (`--wt-pad: 0`). */
    bleed?: boolean;
    /** Content-tier chrome → `.widget-tile--tier-*`. */
    tier?: WidgetTileTier;
    /** Body aspect → `.widget-tile--layout-WxH`. */
    layout?: WidgetTileLayout;
    /** Mosaic footprint → `.widget-tile--span-WxH` (`widget-mosaic.css`). Not `--layout-*`. */
    span?: WidgetTileLayout;
}
/**
 * Allure 3 dashboard card shell (`figure.widget-tile` + bar + body).
 * Thin wrapper — markup SSOT: `design-system/templates/widget-tile.html` /
 * `css/widget-tile.css`. Catalog: `preview/widgets.html#section-widget-tile`
 * (first slot `widget-tile-demo`). Chrome: bar `31px`, pad `6px`,
 * indicator `10px`, radius `--radius-md`. Dots compose `Indicator` /
 * `IndicatorRow`. `bleed` / `tier` / `layout` / `span` are class maps only.
 * `span` is mosaic footprint (`widget-mosaic.css`), not `--layout-*`.
 * Not `ChartTile`, not `WidgetMosaic`, not Highcharts / nivo / sparkline / QG.
 */
export declare function WidgetTile({ title, children, chart, dots, bleed, tier, layout, span, className, ...rest }: WidgetTileProps): import("react").JSX.Element;
//# sourceMappingURL=WidgetTile.d.ts.map