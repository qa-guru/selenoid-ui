import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CapabilitiesLaunchActions } from "./index";

describe("CapabilitiesLaunchActions", () => {
    it("renders native Selenoid buttons for create session", () => {
        render(
            <CapabilitiesLaunchActions
                loading={false}
                disabled={false}
                error=""
                onCreateSession={vi.fn()}
                onClearError={vi.fn()}
            />
        );

        const create = screen.getByTestId("capabilities-create-session");
        expect(create.tagName).toBe("BUTTON");
        expect(create).toHaveClass("new-session", "disabled-false", "error-false");
        expect(create).toHaveTextContent("Create Session");
        expect(screen.queryByTestId("capabilities-more-caps")).toBeNull();
        expect(screen.queryByText("More capabilities")).toBeNull();
    });

    it("invokes create session handler", async () => {
        const user = userEvent.setup();
        const onCreateSession = vi.fn();

        render(
            <CapabilitiesLaunchActions
                loading={false}
                disabled={false}
                error=""
                onCreateSession={onCreateSession}
                onClearError={vi.fn()}
            />
        );

        await user.click(screen.getByTestId("capabilities-create-session"));

        expect(onCreateSession).toHaveBeenCalledTimes(1);
    });
});
