import type { HTMLAttributes, ReactNode } from 'react';
export type StackGap = 'sm' | 'lg';
export interface StackProps extends HTMLAttributes<HTMLDivElement> {
    /** Gap token → `.stack--sm` (`--space-2`) / `.stack--lg` (`--space-6`). Omit → `--space-4`. */
    gap?: StackGap;
    /** Horizontal wrap → `.stack--row` (`flex-direction: row` + `flex-wrap: wrap`). */
    row?: boolean;
    children?: ReactNode;
}
/**
 * Flex stack (`div.stack`). Thin wrapper — markup SSOT:
 * `design-system/templates/stack.html` / `css/stack.css`.
 * Catalog: `preview/chrome.html#section-stack`.
 * Gap is class tokens only (not inline `style.gap`). Not `Grid`, `Section`,
 * `plaque-field-grid-stack`.
 */
export declare function Stack({ gap, row, className, children, ...rest }: StackProps): import("react").JSX.Element;
//# sourceMappingURL=Stack.d.ts.map