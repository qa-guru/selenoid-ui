import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { type BadgeProps } from './Badge';
import { type ButtonProps } from './Button';
export type SessionKillState = 'live' | 'finished';
export type SessionKillButtonProps = Omit<ButtonProps, 'variant' | 'children'> & {
    children?: ReactNode;
    'data-testid'?: string;
};
export type SessionKillFinishedProps = Omit<BadgeProps, 'variant' | 'children'> & {
    children?: ReactNode;
    'data-testid'?: string;
};
export type SessionKillCloseProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
    children?: ReactNode;
    'data-testid'?: string;
};
export interface SessionKillProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    /** Live Stop XOR finished FINISHED. Default `live`. */
    state?: SessionKillState;
    /** Stop session — `Button` danger. Ignored when `state="finished"`. */
    stop?: SessionKillButtonProps;
    /** Delete session — `Button` danger (artifacts). */
    delete?: SessionKillButtonProps;
    /** Close session window — `<a class="btn btn--secondary">`. Not `Link`. */
    close?: SessionKillCloseProps;
    /** FINISHED — `Badge` primary. Ignored when `state="live"`. */
    finished?: SessionKillFinishedProps;
    'data-testid'?: string;
}
/**
 * Session panel body actions (`div.session-info__actions`). Thin compose —
 * markup SSOT: `design-system/templates/session-kill.html`. Catalog:
 * `preview/session.html#section-session-kill`. Composes `Button` danger
 * (Stop / Delete) + `Badge` primary XOR FINISHED + `a.btn.btn--secondary`.
 * No `session-kill.css` (CSS already in `button.css` + `badge.css`). Not
 * `Panel.actions`, not `IconBtn`, not `Link`, not VNC chrome.
 */
export declare function SessionKill({ state, stop, delete: deleteProps, close, finished, className, 'data-testid': dataTestId, ...rest }: SessionKillProps): import("react").JSX.Element;
//# sourceMappingURL=SessionKill.d.ts.map