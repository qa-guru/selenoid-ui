import React from "react";
import { StatsElement } from "./StatsElement";

const Queue = ({ queued = "?" }: any) => {
    return (
        <StatsElement
            className="stats-queue"
            title="How many requests on top of quota are waiting for a slot to be free"
        >
            <div className="title">QUEUED</div>
            <div className="queued">{queued}</div>
        </StatsElement>
    );
};

export default Queue;
