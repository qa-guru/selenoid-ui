import type { PanelAction } from "@zero-design-system/react";

/** 16×16 corners — same paths as design-system templates/icon-fullscreen.html. */
function IconFullscreen() {
    return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6.25V3h3.25" />
            <path d="M13 6.25V3h-3.25" />
            <path d="M3 9.75V13h3.25" />
            <path d="M13 9.75V13h-3.25" />
        </svg>
    );
}

function IconFullscreenExit() {
    return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.25 3v3.25H3" />
            <path d="M9.75 3v3.25H13" />
            <path d="M6.25 13v-3.25H3" />
            <path d="M9.75 13v-3.25H13" />
        </svg>
    );
}

/** Shared Log / HAR bar control — same glyph + title as VncWindow. */
export function fullscreenAction(
    fullscreen: boolean,
    onToggle: () => void,
    testId: string
): PanelAction {
    return {
        icon: fullscreen ? <IconFullscreenExit /> : <IconFullscreen />,
        label: fullscreen ? "Exit fullscreen" : "Enter fullscreen",
        onClick: onToggle,
        "data-testid": testId,
    };
}
