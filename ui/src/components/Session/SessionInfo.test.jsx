import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SessionInfo from "./SessionInfo";

const browser = {
    quota: "alice",
    caps: {
        browserName: "chrome",
        version: "120.0",
        screenResolution: "1920x1080",
        name: "Manual session",
    },
};

describe("SessionInfo", () => {
    it("renders browser chrome and short session id", () => {
        render(<SessionInfo session="abc-def-12345678" browser={browser} />);

        expect(screen.getByText("alice")).toBeInTheDocument();
        expect(screen.getByText("chrome")).toBeInTheDocument();
        expect(screen.getByText("120.0")).toBeInTheDocument();
        expect(screen.getByText("abc-def-")).toBeInTheDocument();
    });

    it("renders Badge for resolution and session name", () => {
        render(<SessionInfo session="abc-def-12345678" browser={browser} />);

        const resolution = screen.getByText("1920x1080");
        expect(resolution).toHaveClass("badge");
        expect(resolution).not.toHaveClass("badge--primary");

        const name = screen.getByText("Manual session");
        expect(name).toHaveClass("badge");
        expect(name).not.toHaveClass("badge--primary");
    });

    it("omits resolution Badge when screenResolution is missing", () => {
        render(
            <SessionInfo
                session="abc-def-12345678"
                browser={{
                    quota: "alice",
                    caps: {
                        browserName: "chrome",
                        version: "120.0",
                        name: "No resolution",
                    },
                }}
            />
        );

        expect(screen.queryByText("1920x1080")).not.toBeInTheDocument();
        expect(screen.getByText("No resolution")).toHaveClass("badge");
    });
});
