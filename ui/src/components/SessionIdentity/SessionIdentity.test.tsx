import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionCapBadges, SessionIdentity } from "./index";

describe("SessionIdentity", () => {
    it("renders browser, version, resolution, and name with a single name rail", () => {
        const { container } = render(
            <SessionIdentity
                caps={{
                    browserName: "chrome",
                    version: "149.0",
                    screenResolution: "1920x1080x24",
                    name: "FullSuite.loginAndCheckout",
                }}
            />
        );

        expect(screen.getByText("chrome")).toHaveClass("name");
        expect(screen.getByText("149.0")).toHaveClass("version");
        const resolution = screen.getByText("1920x1080x24");
        expect(resolution).toHaveClass("session__resolution");
        expect(resolution).not.toHaveClass("badge");
        expect(resolution.previousElementSibling).toHaveClass("version");
        expect(resolution.closest(".browser")).toContainElement(screen.getByText("149.0"));
        const name = screen.getByText("FullSuite.loginAndCheckout");
        expect(name).toHaveClass("session-name");
        expect(name).not.toHaveClass("badge");
        expect(name).not.toHaveClass("session-name_empty");
        expect(name.previousElementSibling).toHaveClass("browser");
        expect(container.querySelector(".browser")).toBeTruthy();
        expect(screen.queryByText("—")).not.toBeInTheDocument();
    });

    it("omits the name node, em dash, and empty rail when Manual session is hidden", () => {
        const { container } = render(
            <SessionIdentity
                caps={{
                    browserName: "chrome",
                    name: "Manual session",
                    labels: { manual: "true" },
                }}
            />
        );

        expect(screen.queryByText("Manual session")).not.toBeInTheDocument();
        expect(screen.queryByText("—")).not.toBeInTheDocument();
        expect(container.querySelector(".session-name")).toBeNull();
        expect(container.querySelector(".session-name_empty")).toBeNull();
        expect(container.querySelector(".browser")).toBeTruthy();
    });

    it("does not render .browser when browserName is missing", () => {
        const { container } = render(
            <SessionIdentity
                caps={{
                    name: "LoginTest",
                    version: "149.0",
                    screenResolution: "1920x1080x24",
                }}
            />
        );

        expect(container.querySelector(".browser")).toBeNull();
        expect(screen.queryByText("149.0")).not.toBeInTheDocument();
        expect(screen.queryByText("1920x1080x24")).not.toBeInTheDocument();
        const name = screen.getByTestId("session-name");
        expect(name).toHaveTextContent("LoginTest");
        expect(name.previousElementSibling).toBeNull();
    });

    it("renders nothing when there is no browser and no display name", () => {
        const { container } = render(<SessionIdentity caps={{ name: "Manual session", labels: { manual: "true" } }} />);
        expect(container).toBeEmptyDOMElement();
    });
});

describe("SessionCapBadges", () => {
    it("matches the live table: primary MANUAL/VNC, default VIDEO/HAR/LOG", () => {
        render(
            <SessionCapBadges
                caps={{
                    enableVNC: true,
                    enableVideo: true,
                    enableHAR: true,
                    enableLog: true,
                    labels: { manual: true },
                    screenResolution: "1920x1080x24",
                }}
            />
        );

        expect(screen.getByText("MANUAL")).toHaveClass("badge", "badge--primary");
        expect(screen.getByText("VNC")).toHaveClass("badge", "badge--primary");
        expect(screen.getByText("VIDEO")).toHaveClass("badge");
        expect(screen.getByText("HAR")).toHaveClass("badge");
        expect(screen.getByText("LOG")).toHaveClass("badge");
        expect(screen.queryByText("1920x1080x24")).not.toBeInTheDocument();
    });

    it("shows HAR/VIDEO/LOG from finished artifacts", () => {
        render(<SessionCapBadges caps={{}} artifacts={{ video: "a.mp4", log: "a.log", har: "a.har" }} />);

        expect(screen.getByText("VIDEO")).toBeInTheDocument();
        expect(screen.getByText("HAR")).toBeInTheDocument();
        expect(screen.getByText("LOG")).toBeInTheDocument();
        expect(screen.queryByText("VNC")).not.toBeInTheDocument();
    });
});
