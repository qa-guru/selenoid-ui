import React from "react";
import { Badge } from "@zero-design-system/react";
import styled from "styled-components";
import { StatsElement } from "./StatsElement";

const brightGreen = "#57ff76";
const brightAmber = "#ffb347";
const brightRed = "#FF5757";

const StyledStatus = styled(StatsElement)`
    .indicator {
        height: 80px;
        transition: all 0.5s ease-out 0.2s;
        text-transform: uppercase;
        display: flex;
        flex-direction: column;
        justify-content: center;

        box-shadow: inset 0px -8px 5px -10px #ffffff;

        &_ok {
            .status {
                color: ${brightGreen};
            }

            box-shadow: inset 0px -9px 5px -10px ${brightGreen};
        }

        &_stale {
            .status {
                color: ${brightAmber};
            }

            box-shadow: inset 0px -9px 5px -10px ${brightAmber};
        }

        &_error {
            .status {
                color: ${brightRed};
            }

            box-shadow: inset 0px -10px 5px -10px ${brightRed};
        }

        .status {
            flex: 1;
            font-weight: 300;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .status-badge {
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
    }
`;

const statusLabel = (status) => {
    switch (status) {
        case "ok":
            return "CONNECTED";
        case "stale":
            return "STALE";
        case "error":
            return "ISSUE";
        default:
            return "UNKNOWN";
    }
};

const badgeVariant = (status) => (status === "ok" ? "primary" : "default");

const Status = ({ status = "unknown", header, version = "unknown", title }) => {
    const tooltip = title || `Version: ${version}`;
    const label = statusLabel(status);

    return (
        <StyledStatus>
            <div id={`${header}-status`} className={`indicator indicator_${status}`}>
                <div className="title">{header}</div>
                <div className="status" title={tooltip}>
                    <Badge
                        variant={badgeVariant(status)}
                        className="status-badge"
                        data-testid={`${header}-status-badge`}
                    >
                        {label}
                    </Badge>
                </div>
            </div>
        </StyledStatus>
    );
};

export default Status;
