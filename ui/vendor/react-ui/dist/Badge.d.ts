import type { HTMLAttributes, ReactNode } from 'react';
export type BadgeVariant = 'default' | 'primary';
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    children: ReactNode;
}
export declare function Badge({ variant, className, children, ...rest }: BadgeProps): import("react").JSX.Element;
//# sourceMappingURL=Badge.d.ts.map