import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonOwnProps = {
    variant?: ButtonVariant;
    block?: boolean;
    children: ReactNode;
};
export type ButtonProps<C extends ElementType = 'button'> = ButtonOwnProps & Omit<ComponentPropsWithoutRef<C>, keyof ButtonOwnProps | 'as'> & {
    /** Render as another element — e.g. `<a>` or a router `Link`. Defaults to `button`. */
    as?: C;
};
export declare function Button<C extends ElementType = 'button'>({ as, variant, block, className, children, ...rest }: ButtonProps<C>): import("react").JSX.Element;
export {};
//# sourceMappingURL=Button.d.ts.map