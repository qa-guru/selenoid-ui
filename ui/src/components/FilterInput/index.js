import React, { forwardRef } from "react";
import styled from "styled-components";
import { IconReset, Input } from "@zero-design-system/react";

/**
 * Session filter, portaled into the canonical header `.header__search`.
 * Library `Input` (`.input`) + DS `icon-btn` clear (`IconReset`). Contract:
 * `Filter...` placeholder, `session-filter-input` testid, titled Clear affordance.
 */
const StyledPanelFilter = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;

    .input {
        padding-right: calc(var(--control-height-md) + var(--space-1, 4px));
    }

    .filter-clear {
        position: absolute;
        right: var(--space-1, 4px);
        width: calc(var(--control-height-md) - 2 * var(--space-1, 4px));
        height: calc(var(--control-height-md) - 2 * var(--space-1, 4px));
        color: var(--color-text-muted, #999);
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
            <Input
                ref={ref}
                placeholder="Filter..."
                value={value}
                data-testid="session-filter-input"
                onChange={onChange}
            />
            <button
                type="button"
                className="icon-btn filter-clear"
                title="Clear"
                aria-label="Clear"
                style={{ visibility: !value ? "hidden" : "visible" }}
                onClick={onClear}
            >
                <span className="icon" aria-hidden="true">
                    <IconReset />
                </span>
            </button>
        </StyledPanelFilter>
    );
});
