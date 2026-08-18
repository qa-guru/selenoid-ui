import type { ReactNode } from 'react';
import { type ConnectionState } from './ConnectionStatus';
export type VncWindowState = ConnectionState;
export interface VncWindowLabels {
    back: string;
    lock: string;
    unlock: string;
    enterFullscreen: string;
    exitFullscreen: string;
    copy: string;
    paste: string;
    /** Destructive: DELETE session / kill container. */
    kill: string;
    /** Panel name in the bar. */
    title: string;
    /** Locked screen — watch only. */
    view: string;
    /** Unlocked screen — interactive. */
    control: string;
}
/** Remote desktop pixels — drives flexible screen `aspect-ratio` via `--vnc-aspect`. */
export interface VncScreenSize {
    width: number;
    height: number;
}
export interface VncWindowProps {
    /** VNC lifecycle state driving chrome + width collapse. */
    state: VncWindowState;
    /** Expands the frame + panel to fill the positioned parent. */
    fullscreen?: boolean;
    /** Screen is interactive (lock open) — swaps the lock glyph. */
    unlocked?: boolean;
    /**
     * Remote desktop size (e.g. from `screenResolution`). Sets `--vnc-aspect` so
     * the screen height follows width × W/H instead of a fixed px. Default CSS: 16/9.
     */
    screenSize?: VncScreenSize;
    /**
     * Optional Back/close control. Omitted unless `back` or `onBack` is set —
     * session close lives on the Session panel, not VNC chrome.
     * Compose with `WindowControl as={Link} tone="danger"`.
     */
    back?: ReactNode;
    /**
     * Custom kill control. When omitted and `onKill` is set, a stop
     * `WindowControl` is rendered in the actions cluster.
     */
    kill?: ReactNode;
    onBack?: () => void;
    onToggleLock?: () => void;
    onToggleFullscreen?: () => void;
    onCopy?: () => void;
    onPaste?: () => void;
    /** DELETE /wd/hub/session/{id} — shown only when set (or `kill` node). */
    onKill?: () => void;
    /** noVNC mount slot (rendered inside `.vnc-window__screen-mount`). */
    children?: ReactNode;
    labels?: Partial<VncWindowLabels>;
    className?: string;
    'data-testid'?: string;
    titleTestId?: string;
}
/**
 * Selenoid VNC window: base panel + chrome (connection status, lock,
 * fullscreen, clipboard) over a black noVNC screen. Close/back is opt-in
 * (`back` / `onBack`). Composes `vnc-window` with `WindowControl` /
 * `ConnectionStatus`.
 */
export declare function VncWindow({ state, fullscreen, unlocked, screenSize, back, kill, onBack, onToggleLock, onToggleFullscreen, onCopy, onPaste, onKill, children, labels, className, 'data-testid': dataTestId, titleTestId, }: VncWindowProps): import("react").JSX.Element;
//# sourceMappingURL=VncWindow.d.ts.map