import React, { forwardRef } from "react";
import { IconBtn, IconReset, Input } from "@zero-design-system/react";

/**
 * Session filter, portaled into the canonical header `.header__search`.
 * Library `Input` (`.input`) + library `IconBtn` clear (`IconReset`). Contract:
 * `Filter...` placeholder, `session-filter-input` testid, titled Clear affordance.
 * `IconBtn` owns `.icon`; keep `filter-clear` for overlay positioning.
 */
export const FilterInput = forwardRef<HTMLInputElement, any>(function FilterInput({ value, onChange, onClear }, ref) {
    return (
        <div
            className="filter-input"
            onClick={() => {
                if (ref && typeof ref !== "function" && ref.current) {
                    ref.current.focus();
                }
            }}
        >
            <Input
                ref={ref}
                id="session-filter-input"
                name="session-filter"
                type="search"
                autoComplete="off"
                placeholder="Filter..."
                value={value}
                data-testid="session-filter-input"
                aria-label="Filter sessions"
                onChange={onChange}
            />
            <IconBtn
                className="filter-clear"
                title="Clear"
                aria-label="Clear"
                style={{ visibility: !value ? "hidden" : "visible" }}
                onClick={onClear}
            >
                <IconReset />
            </IconBtn>
        </div>
    );
});
