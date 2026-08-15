import React from "react";
import { StyledStats } from "./style.css";

import Browsers from "../../components/Browsers";
import PoolSlots from "../../components/PoolSlots";

const Stats = ({ state, browsers }: any) => {
    return (
        <StyledStats>
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
        </StyledStats>
    );
};

export default Stats;
