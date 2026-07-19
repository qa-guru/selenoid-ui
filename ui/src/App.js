import React from "react";
import { HashRouter as Router } from "react-router-dom";

import SelenoidAppHeader from "./components/SelenoidAppHeader";
import Viewport from "./containers/Viewport";

const App = () => {
    return (
        <Router>
            <SelenoidAppHeader />
            <Viewport />
        </Router>
    );
};

export default App;
