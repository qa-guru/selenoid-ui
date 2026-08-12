import type { AnchorHTMLAttributes, ReactNode } from 'react';
export type LinkVariant = 'default' | 'nav';
export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    variant?: LinkVariant;
    active?: boolean;
    children: ReactNode;
}
export declare function Link({ variant, active, className, children, 'aria-current': ariaCurrent, ...rest }: LinkProps): import("react").JSX.Element;
//# sourceMappingURL=Link.d.ts.map