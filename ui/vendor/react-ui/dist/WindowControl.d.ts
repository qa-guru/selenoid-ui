import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
export type WindowControlTone = 'danger' | 'info' | 'success' | 'neutral';
type WindowControlOwnProps = {
    /** Signal-circle colour. Defaults to `neutral`. */
    tone?: WindowControlTone;
    /** Adds `vnc-window__session-control` (CSS-hidden until VNC is connected). */
    sessionControl?: boolean;
    /** Glyph node (rendered inside `.icon`). */
    children: ReactNode;
};
export type WindowControlProps<C extends ElementType = 'button'> = WindowControlOwnProps & Omit<ComponentPropsWithoutRef<C>, keyof WindowControlOwnProps | 'as'> & {
    /** Render as another element — e.g. a router `Link` for Back. Defaults to `button`. */
    as?: C;
};
/**
 * Interactive VNC chrome control: 30×30 hit area, 15×15 signal circle, glyph
 * revealed on hover/focus. Composes the `window-control` primitive.
 */
export declare function WindowControl<C extends ElementType = 'button'>({ as, tone, sessionControl, className, children, ...rest }: WindowControlProps<C>): import("react").JSX.Element;
export {};
//# sourceMappingURL=WindowControl.d.ts.map