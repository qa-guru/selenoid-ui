import type { ButtonHTMLAttributes, ReactNode } from 'react';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    block?: boolean;
    children: ReactNode;
}
export declare function Button({ variant, block, className, children, type, ...rest }: ButtonProps): import("react").JSX.Element;
//# sourceMappingURL=Button.d.ts.map