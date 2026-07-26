import React from "react";
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
        <tr data-testid="browser-row">
            <td className="name">{name}</td>
            <td className="count">{used}</td>
            <td className="share">
                <span className="percent">{perc}%</span>
                <div className="usage-track" aria-hidden="true">
                    <div
                        className="usage-bar"
                        data-testid="browser-usage-bar"
                        style={{
                            width: `${perc}%`,
                            backgroundColor: usageBarColor(perc),
                        }}
                    />
                </div>
            </td>
        </tr>
    );
};

Browser.propTypes = {
    name: PropTypes.string.isRequired,
    used: PropTypes.number.isRequired,
    totalUsed: PropTypes.number.isRequired,
};

export default Browser;
