import React from "react";
import { NavLink, Route, Routes } from "react-router-dom";

import BrowserPools from "./BrowserPools";
import ResourcesPage from "./ResourcesPage";
import { StyledDocs } from "./style.css";

const TOC = [
    { to: "/docs", label: "Browser pools", testid: "docs-nav-pools", end: true },
    { to: "/docs/resources", label: "Resources", testid: "docs-nav-resources", end: false },
] as const;

const Docs = () => {
    return (
        <StyledDocs data-testid="docs-page">
            <nav className="docs__toc" aria-label="Docs" data-testid="docs-nav">
                {TOC.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            isActive ? "docs__toc-link is-active" : "docs__toc-link"
                        }
                        data-testid={item.testid}
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>
            <div className="docs__article">
                <Routes>
                    <Route index element={<BrowserPools />} />
                    <Route path="resources" element={<ResourcesPage />} />
                </Routes>
            </div>
        </StyledDocs>
    );
};

export default Docs;
