import type { PanelAction } from "@zero-design-system/react";
import { IconFullscreen, IconFullscreenExit } from "@zero-design-system/react";

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
