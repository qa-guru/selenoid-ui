import React, { forwardRef } from "react";
import { Input } from "@zero-design-system/react";
import styled from "styled-components";

const statsBgColor = "#272727";

const StyledPanelFilter = styled.div`
    flex: 1;
    display: flex;
    box-sizing: border-box;
    min-width: 190px;
    height: 100%;
    align-items: center;
    color: #fff;

    .input {
        flex: 1;
        height: 30px;
        outline: none;
        background-color: ${statsBgColor};
        border: 0;
        padding: 0;
        font-size: 1.2em;
        color: #f2f4f3;
        margin-left: 5px;
        font-weight: 100;
    }
`;

/**
 * Session filter — v3 pilot on @zero-design-system/react Input primitive.
 * Replaces react-input-autosize for the stats-bar search field.
 */
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
            <i
                title="Clear"
                className="icon dripicons-cross"
                style={{ visibility: !value ? "hidden" : "visible" }}
                onClick={onClear}
            />
        </StyledPanelFilter>
    );
});
