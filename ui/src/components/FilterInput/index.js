import React, { forwardRef } from "react";
import styled from "styled-components";

/**
 * Session filter, portaled into the canonical header `.header__search`. The
 * input keeps the design-system `.input` styling (tokens.css / input.css) so it
 * matches the header search slot; the wrapper only positions the clear icon and
 * proxies clicks to focus. Contract preserved: `.input` class, `Filter...`
 * placeholder, `session-filter-input` testid, and a titled Clear affordance.
 */
const StyledPanelFilter = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;

    .input {
        padding-right: var(--space-6, 32px);
    }

    .filter-clear {
        position: absolute;
        right: var(--space-3, 12px);
        cursor: pointer;
        color: var(--color-text-muted, #999);
        line-height: 0;
    }
`;

export const FilterInput = forwardRef(function FilterInput({ value, onChange, onClear }, ref) {
    return (
        <StyledPanelFilter
            onClick={() => {
                if (ref && typeof ref !== "function" && ref.current) {
                    ref.current.focus();
                }
            }}
        >
            <input
                ref={ref}
                className="input"
                placeholder="Filter..."
                value={value}
                data-testid="session-filter-input"
                onChange={onChange}
            />
            <i
                title="Clear"
                className="icon dripicons-cross filter-clear"
                style={{ visibility: !value ? "hidden" : "visible" }}
                onClick={onClear}
            />
        </StyledPanelFilter>
    );
});
