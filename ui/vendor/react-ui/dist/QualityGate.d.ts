import type { HTMLAttributes } from 'react';
import { type QualityGateConfig, type QualityGateKind, type QualityGateLabel, type QualityGateLang, type QualityGateRule } from './quality-gate-canon.js';
export type { QualityGateConfig, QualityGateFileSource, QualityGateKind, QualityGateLabel, QualityGateLang, QualityGateRule, } from './quality-gate-canon.js';
export interface QualityGateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
    rules: readonly QualityGateRule[];
    /** Gate verdict. Default `false` (`Boolean(passed)` in `renderQualityGate`). */
    passed?: boolean;
    /** Copy for aria-label + passed verdict. Default `ru`. */
    lang?: QualityGateLang;
    /** Bar heading. Default `Quality gate`. Catalog uses `Allure Quality Gate`. */
    barTitle?: string;
    /** Popover payload + path source (`QgInfo` → `createQgInfo`). */
    config?: QualityGateConfig;
    labels?: {
        passed?: QualityGateLabel;
        failed?: QualityGateLabel;
    };
    /** Tile modifier. Default `allure` (not `sonar`). */
    kind?: QualityGateKind;
    /** Popover JSON. Default Allure `buildQualityGateInfoPayload`. */
    infoPayload?: Record<string, unknown>;
    'data-testid'?: string;
}
/**
 * Allure quality gate (`div.quality-gate` + `__bar` + `__body`).
 * Thin wrapper — markup SSOT: `design-system/templates/quality-gate.html` /
 * `css/quality-gate.css`. Embed SSOT: `renderQualityGate` /
 * `resolveQualityGateLabel` / `formatQualityGateRuleFormula` /
 * `buildQualityGateInfoPayload` in `js/quality-gate.js`. Bar info composes
 * `QgInfo` (`content` + `fileSource`); pin / hover stay in `createQgInfo`
 * via that wrapper. Catalog: `preview/widgets.html#section-quality-gate`
 * (`quality-gate-demo-failed` / `-passed`; not `quality-gate-variants`).
 * Hybrid tile only (`__bar`, not callout-without-bar). Default `lang` `ru`,
 * `kind` `allure`, barTitle `Quality gate`. Empty `rules` → hidden empty
 * host. Sonar adapter is `SonarQualityGate` (compose `kind="sonar"` +
 * `infoPayload`, not a second chrome). Not tests-table / Sparkline /
 * StabilityCell / WidgetTile / mosaic / ChartTile / CodeHighlight.
 */
export declare function QualityGate({ rules, passed, lang, barTitle, config, labels, kind, infoPayload: infoPayloadProp, className, 'aria-label': ariaLabel, 'data-testid': dataTestId, ...rest }: QualityGateProps): import("react").JSX.Element;
//# sourceMappingURL=QualityGate.d.ts.map