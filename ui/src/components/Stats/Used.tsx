import React from "react";
import { StatsElement } from "./StatsElement";

const Used = ({ used, pending, total }: any) => {
    const perc = total > 0 ? (((used + pending) / total) * 100).toFixed() : "?";

    return (
        <StatsElement className="stats-used">
            <div className="title">USED</div>
            <div className="used">
                {perc}
                <span className="small">%</span>
            </div>
        </StatsElement>
    );
};

export default Used;
