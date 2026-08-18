import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionCapBadges, SessionIdentity } from "./index";

describe("SessionIdentity", () => {
    it("renders browser, version, resolution, and truncated name with the table rail", () => {
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
        expect(container.querySelector(".browser")).toBeTruthy();
    });

    it("hides default Manual session label", () => {
        render(
            <SessionIdentity
                caps={{
                    browserName: "chrome",
                    name: "Manual session",
                    labels: { manual: "true" },
                }}
            />
        );

        expect(screen.queryByText("Manual session")).not.toBeInTheDocument();
        expect(document.querySelector(".session-name[title='Manual session']")).toHaveClass("session-name_empty");
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
