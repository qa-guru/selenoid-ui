export declare const POLL_DEFAULT_MS = 5000;
export interface PollToggleProps {
    className?: string;
    testId?: string;
    labelTestId?: string;
    /** Poll interval in ms. Default 5000. */
    intervalMs?: number;
    /** Initial pressed/on state. Default true. */
    defaultOn?: boolean;
    /** Controlled on state. */
    on?: boolean;
    /** Called on each tick while polling is on (not on mount unless `tickOnMount`). */
    onTick?: () => void;
    /** Called when the user toggles auto-refresh. */
    onChange?: (on: boolean) => void;
    /** Fire `onTick` once when polling starts (including defaultOn). Default false. */
    tickOnMount?: boolean;
}
export declare function formatPollLabel(ms: number): string;
export declare function PollIcon(): import("react").JSX.Element;
export declare function PollToggle({ className, testId, labelTestId, intervalMs, defaultOn, on: onProp, onTick, onChange, tickOnMount, }: PollToggleProps): import("react").JSX.Element;
//# sourceMappingURL=PollToggle.d.ts.map