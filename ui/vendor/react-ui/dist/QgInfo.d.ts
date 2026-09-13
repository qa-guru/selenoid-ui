import type { HTMLAttributes } from 'react';
import { type QgInfoFileSource } from './qg-info-canon.js';
export type { QgInfoFileSource };
export interface QgInfoProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'content'> {
    /** JSON payload or source string → `createQgInfo`. */
    content: string | Record<string, unknown>;
    /** Path rows (config / rules / known / profile / project). */
    fileSource?: QgInfoFileSource;
    'data-testid'?: string;
}
/**
 * Quality gate info icon + popover (`div.qg-info`).
 * Thin wrapper — markup SSOT: `design-system/templates/qg-info.html` /
 * `css/qg-info.css`. Embed SSOT: `createQgInfo` in `js/qg-info.js`
 * (hover / pin / `--open` / `--pinned` stay in the primitive — not a React
 * rewrite). Catalog: `preview/widgets.html#section-qg-info` (`qg-info-demo`).
 * Template + default `data-testid="qg-info"`. Host:
 * `div.qg-info` > `button.icon-btn.qg-info__trigger` (aria-label
 * «Quality gate config») + `div.qg-info__popover` (`ul.qg-info__paths`
 * config / rules / known + `pre.qg-info__code`). Live node is a sibling of
 * a hidden React slot so `QualityGate` `.quality-gate__bar > .qg-info`
 * (canon / CSS) holds. Not QualityGate / SonarQualityGate / PlaqueField /
 * PlaqueNumber / WidgetTile / Sparkline / CodeHighlight / variants /
 * configurator-layout.
 */
export declare function QgInfo({ content, fileSource, className, 'data-testid': dataTestId, ...rest }: QgInfoProps): import("react").JSX.Element;
//# sourceMappingURL=QgInfo.d.ts.map