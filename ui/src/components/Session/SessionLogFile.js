import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Panel } from "@zero-design-system/react";

import { StyledLog } from "../Log/style.css";

/**
 * Finished-session log panel — loads the static hub artifact `/logs/<file>`
 * (live sessions use the websocket Log component instead).
 */
const SessionLogFile = ({ file }) => {
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
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.text();
            })
            .then((body) => {
                if (!cancelled) {
                    setText(body);
                    setPhase("ready");
                }
            })
            .catch((err) => {
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
        <StyledLog data-testid="session-log-file">
            <Panel
                variant="terminal"
                title="Session logs"
                testId="session-log-file-panel"
                titleTestId="session-log-file-title"
                className="log-card"
                bodyClassName="log-card__body"
            >
                <div className="log-file-toolbar">
                    <a
                        className="log-file-toolbar__link"
                        href={href}
                        download={file}
                        data-testid="session-log-download"
                    >
                        Download
                    </a>
                </div>
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

SessionLogFile.propTypes = {
    file: PropTypes.string,
};

export default SessionLogFile;
