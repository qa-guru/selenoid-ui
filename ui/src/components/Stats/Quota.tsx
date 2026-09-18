import React from "react";

import { StatsElement } from "./StatsElement";

const Quota = ({ used = "?", pending = "?", total = "?" }: any) => {
    return (
        <StatsElement className="stats-quota">
            <div className="title">QUOTA</div>
            <div className="numbers">
                <span title="Used - how many containers run in parallel right now">{used}</span>{" "}
                <span className="pending" title="Pending (Starting...)">
                    + {pending}
                </span>{" "}
                / <span title="Total - how many containers can run in parallel">{total}</span>
            </div>
        </StatsElement>
    );
};

export default Quota;
