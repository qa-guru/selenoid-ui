import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
export interface SegmentedControlProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}
/**
 * Two equal-width options (`.segmented-control`). Pair with `SegmentedControlBtn`.
 * Markup SSOT: `design-system/templates/segmented-control.html` / `css/segmented-control.css`.
 * Catalog: `preview/fields.html#section-segmented-control`.
 * Not `PlaqueFieldSeg` / `.plaque-field-check`, not `Tab`, not `Radio` / `Checkbox`.
 */
export declare function SegmentedControl({ className, children, ...rest }: SegmentedControlProps): import("react").JSX.Element;
export interface SegmentedControlBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Selected state → `.segmented-control__btn--active`. */
    active?: boolean;
    children: ReactNode;
}
/**
 * Segment trigger (`.segmented-control__btn` / `--active`). Thin wrapper — no
 * keyboard roving tabindex; host owns selection. 50/50 flex, min-height
 * `--control-height-md` (primitive CSS).
 */
export declare function SegmentedControlBtn({ active, className, type, children, ...rest }: SegmentedControlBtnProps): import("react").JSX.Element;
//# sourceMappingURL=SegmentedControl.d.ts.map