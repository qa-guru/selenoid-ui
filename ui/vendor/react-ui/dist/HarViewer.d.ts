import { type ReactNode } from 'react';
export declare const HAR_TIMING_KEYS: readonly ['blocked', 'dns', 'connect', 'ssl', 'send', 'wait', 'receive'];
export type HarDetailTab = 'headers' | 'timings' | 'response';
export interface HarHeader {
    name?: string;
    value?: string;
}
export interface HarContent {
    size?: number;
    mimeType?: string;
    text?: string;
    encoding?: string;
}
export interface HarEntry {
    time?: number;
    startedDateTime?: string;
    request?: {
        method?: string;
        url?: string;
        headers?: HarHeader[];
    };
    response?: {
        status?: number;
        statusText?: string;
        headers?: HarHeader[];
        content?: HarContent;
    };
    timings?: Partial<Record<(typeof HAR_TIMING_KEYS)[number], number>>;
}
export declare function formatSize(n: unknown): string;
export declare function formatTiming(n: unknown): string;
export declare function harStatusClass(status: unknown): string;
export interface HarViewerProps {
    entries: HarEntry[];
    expandedIndex?: number | null;
    detailTab?: HarDetailTab;
    onToggleRow?: (index: number) => void;
    onDetailTabChange?: (tab: HarDetailTab) => void;
    /** Shown when entries is empty (loading / recording / error). */
    empty?: ReactNode;
    className?: string;
    testId?: string;
}
/** Presentational HAR table. Poll / Panel / download stay in the app shell. */
export declare function HarViewer({ entries, expandedIndex, detailTab, onToggleRow, onDetailTabChange, empty, className, testId, }: HarViewerProps): import("react").JSX.Element;
//# sourceMappingURL=HarViewer.d.ts.map