import React from "react";
import BeatLoader from "react-spinners/BeatLoader";

export function CapabilitiesLaunchActions({ loading, disabled, error, onCreateSession, onClearError }: any) {
    return (
        <div className="capabilities-launch-actions">
            <button
                type="button"
                className={`new-session disabled-${disabled} error-${Boolean(error)}`}
                data-testid="capabilities-create-session"
                disabled={disabled}
                onClick={onCreateSession}
                title={error || undefined}
            >
                {loading ? <BeatLoader size={3} color="currentColor" /> : "Create Session"}
            </button>
            {error ? (
                <div className="capabilities-create-error" data-testid="capabilities-create-error" role="alert">
                    {error}
                    <button
                        type="button"
                        className="capabilities-create-error__dismiss"
                        data-testid="capabilities-create-error-dismiss"
                        onClick={onClearError}
                    >
                        Dismiss
                    </button>
                </div>
            ) : null}
        </div>
    );
}
