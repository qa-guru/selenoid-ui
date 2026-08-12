import type { HTMLAttributes } from 'react';
export type ConnectionState = 'connecting' | 'disconnecting' | 'disconnected' | 'connected';
export interface ConnectionStatusProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
    /** VNC lifecycle state. `connected` renders hidden (CSS). */
    state: ConnectionState;
}
/**
 * Non-interactive square lifecycle indicator for the VNC window.
 * Composes the `connection-status` primitive.
 */
export declare function ConnectionStatus({ state, className, role, 'aria-label': ariaLabel, ...rest }: ConnectionStatusProps): import("react").JSX.Element;
//# sourceMappingURL=ConnectionStatus.d.ts.map