import React from "react";
import { Button } from "@zero-design-system/react";
import BeatLoader from "react-spinners/BeatLoader";

/**
 * Capabilities launch actions — v3.2 pilot on @zero-design-system/react Button.
 */
export function CapabilitiesLaunchActions({
    loading,
    disabled,
    error,
    showMoreCapabilities,
    useMoreCaps,
    onCreateSession,
    onToggleMoreCaps,
    onClearError,
}) {
    return (
        <div className="capabilities-launch-actions">
            <Button
                type="button"
                variant="secondary"
                block
                className={`new-session disabled-${disabled} error-${Boolean(error)}`}
                data-testid="capabilities-create-session"
                disabled={disabled}
                onClick={onCreateSession}
                onMouseLeave={onClearError}
                title={error}
            >
                {loading ? <BeatLoader size={3} color={"#fff"} /> : "Create Session"}
            </Button>
            {showMoreCapabilities ? (
                <Button
                    type="button"
                    variant="ghost"
                    className="new-session-more-capabilities"
                    data-testid="capabilities-more-caps"
                    onClick={onToggleMoreCaps}
                >
                    {useMoreCaps ? "Hide capabilities" : "More capabilities"}
                </Button>
            ) : null}
        </div>
    );
}
