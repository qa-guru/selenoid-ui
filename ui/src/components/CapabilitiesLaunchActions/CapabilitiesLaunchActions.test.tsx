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
        expect(create!).toHaveClass("new-session", "disabled-false", "error-false");
        expect(create!).toHaveTextContent("Create Session");
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

        expect(onCreateSession!).toHaveBeenCalledTimes(1);
    });

    it("shows a spinner while loading and marks the button disabled", () => {
        render(
            <CapabilitiesLaunchActions
                loading
                disabled
                error=""
                onCreateSession={vi.fn()}
                onClearError={vi.fn()}
            />
        );

        const create = screen.getByTestId("capabilities-create-session");
        expect(create).toBeDisabled();
        expect(create).toHaveClass("disabled-true", "error-false");
        expect(create).not.toHaveTextContent("Create Session");
    });

    it("surfaces Create Session error in an alert until dismiss", async () => {
        const user = userEvent.setup();
        const onClearError = vi.fn();
        const message =
            "Create Session rejected: 152.0-min is a headless CI image and does not support enableVideo — use the full image, or turn those options off";
        render(
            <CapabilitiesLaunchActions
                loading={false}
                disabled={false}
                error={message}
                onCreateSession={vi.fn()}
                onClearError={onClearError}
            />
        );

        const create = screen.getByTestId("capabilities-create-session");
        expect(create).toHaveClass("error-true");
        expect(create).toHaveAttribute("title", message);
        const plaque = screen.getByTestId("capabilities-create-error");
        expect(plaque).toHaveTextContent(message);
        expect(plaque.querySelector(".capabilities-create-error__text")).toHaveTextContent(message);

        await user.hover(create);
        await user.unhover(create);
        expect(onClearError).not.toHaveBeenCalled();

        await user.click(screen.getByTestId("capabilities-create-error-dismiss"));
        expect(onClearError).toHaveBeenCalled();
    });
});
