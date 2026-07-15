import React from "react";
import BeatLoader from "react-spinners/BeatLoader";

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
            <button
                type="button"
                className={`new-session disabled-${disabled} error-${Boolean(error)}`}
                data-testid="capabilities-create-session"
                disabled={disabled}
                onClick={onCreateSession}
                onMouseLeave={onClearError}
                title={error}
            >
                {loading ? <BeatLoader size={3} color={"#fff"} /> : "Create Session"}
            </button>
            {showMoreCapabilities ? (
                <button
                    type="button"
                    className="new-session-more-capabilities"
                    data-testid="capabilities-more-caps"
                    onClick={onToggleMoreCaps}
                >
                    {useMoreCaps ? "Hide capabilities" : "More capabilities"}
                </button>
            ) : null}
        </div>
    );
}
