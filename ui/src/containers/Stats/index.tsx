import React from "react";

import Browsers from "../../components/Browsers";
import PoolSlots from "../../components/PoolSlots";

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
        </div>
    );
};

export default Stats;
