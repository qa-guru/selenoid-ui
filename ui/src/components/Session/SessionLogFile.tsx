import React, { useEffect, useState } from "react";
import { IconDownload, Panel } from "@zero-design-system/react";

import { StyledLog } from "../Log/style.css";
import { fullscreenAction } from "../fullscreenAction";

/**
 * Finished-session log panel — loads the static hub artifact `/logs/<file>`
 * (live sessions use the websocket Log component instead).
 */
const SessionLogFile = ({ file, fullscreen, onToggleFullscreen }: any) => {
    const [text, setText] = useState("");
    const [phase, setPhase] = useState(file ? "loading" : "idle");
    const [error, setError] = useState("");
    const href = file ? `/logs/${file}` : null;

    useEffect(() => {
        if (!file || !href) {
            setPhase("idle");
            setText("");
            setError("");
            return undefined;
        }

        let cancelled = false;
        setPhase("loading");
        setError("");

        fetch(href, { cache: "no-store" })
            .then(async (res: any) => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.text();
            })
            .then((body: any) => {
                if (!cancelled) {
                    setText(body);
                    setPhase("ready");
                }
            })
            .catch((err: any) => {
                if (!cancelled) {
                    setError(err?.message || "Failed to load log");
                    setPhase("error");
                }
            });

        return () => {
            cancelled = true;
        };
    }, [file, href]);

    if (!file) {
        return null;
    }

    return (
        <StyledLog
            className={`session-peer${fullscreen ? " panel-host--fullscreen" : ""}`}
            data-testid="session-log-file"
        >
            <Panel
                variant="terminal"
                barChrome
                title="Session logs"
                testId="session-log-file-panel"
                titleTestId="session-log-file-title"
                className="log-card"
                bodyClassName="log-card__body"
                actions={[
                    ...(onToggleFullscreen
                        ? [fullscreenAction(Boolean(fullscreen), onToggleFullscreen, "session-log-fullscreen")]
                        : []),
                    {
                        icon: <IconDownload />,
                        label: "Download",
                        onClick: () => {
                            const a = document.createElement("a");
                            a.href = href!;
                            a.download = file;
                            a.click();
                        },
                        "data-testid": "session-log-download",
                    },
                ]}
            >
                {phase === "ready" ? (
                    <pre className="log-file-pre" data-testid="session-log-file-body">
                        {text || "(empty log)"}
                    </pre>
                ) : (
                    <div className="log-file-empty" data-testid="session-log-file-empty">
                        {phase === "loading" && "Loading session log…"}
                        {phase === "error" && `Error: ${error}`}
                    </div>
                )}
            </Panel>
        </StyledLog>
    );
};

export default SessionLogFile;
