import React from "react";

import Browsers from "../../components/Browsers";
import PoolSlots from "../../components/PoolSlots";
import PoolRoutingPanel from "../../components/PoolRouting";

const Stats = ({ state, browsers }: any) => {
    return (
        <div className="stats">
            <Browsers browsers={browsers} totalUsed={state.used} />
            <PoolSlots
                title="Warm pool"
                testId="warm-slots-panel"
                titleTestId="warm-slots-title"
                slots={state.warmSlots}
            />
            <PoolSlots
                title="Hot pool"
                testId="hot-slots-panel"
                titleTestId="hot-slots-title"
                slots={state.hotSlots}
            />
            <PoolRoutingPanel routing={state.poolRouting} />
        </div>
    );
};

export default Stats;
