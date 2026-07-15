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
                showMoreCapabilities={true}
                useMoreCaps={false}
                onCreateSession={vi.fn()}
                onToggleMoreCaps={vi.fn()}
                onClearError={vi.fn()}
            />
        );

        const create = screen.getByTestId("capabilities-create-session");
        expect(create.tagName).toBe("BUTTON");
        expect(create).toHaveClass("new-session", "disabled-false", "error-false");
        expect(create).toHaveTextContent("Create Session");
    });

    it("invokes create and more-capabilities handlers", async () => {
        const user = userEvent.setup();
        const onCreateSession = vi.fn();
        const onToggleMoreCaps = vi.fn();

        render(
            <CapabilitiesLaunchActions
                loading={false}
                disabled={false}
                error=""
                showMoreCapabilities={true}
                useMoreCaps={false}
                onCreateSession={onCreateSession}
                onToggleMoreCaps={onToggleMoreCaps}
                onClearError={vi.fn()}
            />
        );

        await user.click(screen.getByTestId("capabilities-create-session"));
        await user.click(screen.getByTestId("capabilities-more-caps"));

        expect(onCreateSession).toHaveBeenCalledTimes(1);
        expect(onToggleMoreCaps).toHaveBeenCalledTimes(1);
    });
});
