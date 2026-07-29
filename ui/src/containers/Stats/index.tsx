import React from "react";
import { StyledStats } from "./style.css";

import Browsers from "../../components/Browsers";

const Stats = ({ state, browsers }: any) => {
    return (
        <StyledStats>
            <Browsers browsers={browsers} totalUsed={state.used} />
        </StyledStats>
    );
};

export default Stats;
