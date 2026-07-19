import React from "react";
import { StyledBrowser } from "./style.css";
import PropTypes from "prop-types";

/**
 * Usage-bar accent from DS semantic tokens (cool → warm by load).
 * @param {number|string} percentile
 * @returns {string} CSS color using var(--color-*)
 */
export function usageBarColor(percentile) {
    const pct = Math.min(100, Math.max(0, Number(percentile) || 0));
    if (pct < 30) {
        return "var(--color-info)";
    }
    if (pct < 70) {
        return "var(--color-warning)";
    }
    return "var(--color-danger)";
}

const Browser = ({ name, used, totalUsed }) => {
    const perc = totalUsed > 0 ? ((used / totalUsed) * 100).toFixed() : 0;

    return (
        <StyledBrowser data-testid="browser-row">
            <div className="stats">
                <div className="percent">{perc}%</div>
                <div className="count">{used}</div>
                <div className="name">{name}</div>
            </div>
            <div
                className="usage-bar"
                data-testid="browser-usage-bar"
                style={{
                    width: `${perc}%`,
                    borderBottomColor: usageBarColor(perc),
                }}
            />
        </StyledBrowser>
    );
};

Browser.propTypes = {
    name: PropTypes.string.isRequired,
    used: PropTypes.number.isRequired,
    totalUsed: PropTypes.number.isRequired,
};

export default Browser;
