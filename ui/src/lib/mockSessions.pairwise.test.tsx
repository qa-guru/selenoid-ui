import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Sessions from "../components/Sessions";
import {
    LIVE_SESSION_FACTORS,
    LIVE_SESSION_SEEDS,
    liveSessionAllowed,
    liveSessionRows,
    MOCK_SESSION_ID,
} from "./mockSessionMatrix";
import { MOCK_LIVE_SESSIONS, mockLivePreview } from "./mockSessions";
import { uncoveredPairs } from "./pairwise";

vi.mock("../components/Sessions/service", () => ({
    useSessionDelete: () => [false, vi.fn()],
}));

describe("mock live sessions pairwise matrix", () => {
    it("covers every allowed factor pair", () => {
        const rows = liveSessionRows();
        expect(uncoveredPairs(LIVE_SESSION_FACTORS, rows, liveSessionAllowed)).toEqual([]);
        expect(rows.length).toBeGreaterThanOrEqual(3);
        expect(rows.length).toBeLessThan(40);
    });

    it("keeps stable max / min / freeze seeds", () => {
        const rows = liveSessionRows();
        expect(rows[0]).toEqual(LIVE_SESSION_SEEDS.max);
        expect(rows[1]).toEqual(LIVE_SESSION_SEEDS.min);
        expect(rows[2]).toEqual(LIVE_SESSION_SEEDS.freeze);

        expect(MOCK_LIVE_SESSIONS[MOCK_SESSION_ID.max]?.preview).toBe("active");
        expect(MOCK_LIVE_SESSIONS[MOCK_SESSION_ID.min]?.caps?.enableVNC).toBe(false);
        expect(MOCK_LIVE_SESSIONS[MOCK_SESSION_ID.freeze]?.starting).toBe(true);
        expect(mockLivePreview(MOCK_SESSION_ID.max)).toBe("active");
        expect(mockLivePreview(MOCK_SESSION_ID.freeze)).toBe("starting");
        expect(mockLivePreview(MOCK_SESSION_ID.min)).toBe("stub");
    });

    it("renders the pairwise set in Live sessions", () => {
        render(
            <MemoryRouter>
                <Sessions sessions={MOCK_LIVE_SESSIONS} query="" />
            </MemoryRouter>
        );

        const list = screen.getByTestId("sessions-panel");
        expect(list.querySelectorAll(".session").length).toBe(Object.keys(MOCK_LIVE_SESSIONS).length);
        expect(screen.getByText("max.user")).toBeInTheDocument();
        expect(screen.getAllByTitle("Starting…").length).toBeGreaterThan(0);
        expect(screen.getAllByText("HAR").length).toBeGreaterThan(0);
        expect(screen.getAllByText("VNC").length).toBeGreaterThan(0);
        expect(screen.getAllByText("VIDEO").length).toBeGreaterThan(0);
        expect(screen.getAllByText("LOG").length).toBeGreaterThan(0);
        expect(screen.getAllByText("android").length).toBeGreaterThan(0);
        expect(screen.getAllByText("playwright-chromium").length).toBeGreaterThan(0);
    });
});
