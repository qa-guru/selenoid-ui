/** Ambient modules for deps without usable @types (or deep subpath imports). */

declare module "@novnc/novnc" {
    export default class RFB {
        constructor(target: HTMLElement, url: string, options?: Record<string, unknown>);
        disconnect(): void;
        addEventListener(type: string, listener: (...args: unknown[]) => void): void;
        removeEventListener(type: string, listener: (...args: unknown[]) => void): void;
        scaleViewport: boolean;
        resizeSession: boolean;
    }
}

declare module "@novnc/novnc/lib/rfb.js" {
    export { default } from "@novnc/novnc";
}

declare module "ansi-256-colors" {
    const colors: {
        fg: { getRgb: (r: number, g: number, b: number) => string };
        bg: { getRgb: (r: number, g: number, b: number) => string };
        reset: string;
    };
    export default colors;
}

declare module "event-source-polyfill" {
    export class EventSourcePolyfill extends EventSource {}
}

declare module "url-parse" {
    interface UrlParse {
        protocol: string;
        slashes: boolean;
        auth: string;
        username: string;
        password: string;
        host: string;
        hostname: string;
        port: string;
        pathname: string;
        query: Record<string, string | undefined> | string;
        hash: string;
        href: string;
        origin: string;
        set(key: string, value: string): UrlParse;
        toString(): string;
    }
    function parse(url: string, parseQuery?: boolean): UrlParse;
    export default parse;
}

declare module "*.css" {
    const css: string;
    export default css;
}

declare module "@zero-design-system/react/styles.css" {
    const css: string;
    export default css;
}

declare module "*?v=*" {
    const mod: unknown;
    export default mod;
}

interface Window {
    __designSystemRemountHeader?: () => Promise<void> | void;
    headerConfig?: any;
}

declare module "react-transition-group" {
    import type { ComponentType, ReactNode } from "react";
    export const CSSTransition: ComponentType<any>;
    export const TransitionGroup: ComponentType<any>;
    export const Transition: ComponentType<any>;
}

declare module "../../public/js/header.js" {
    export function remountHeader(): Promise<void>;
}

declare module "*header.js" {
    export function remountHeader(): Promise<void>;
}

declare module "eventsourcemock";
