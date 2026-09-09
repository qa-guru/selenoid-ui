import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import SessionVideo from "./SessionVideo";

describe("SessionVideo", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("keeps the 16:9 waiting body while the mp4 is not ready", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

        render(<SessionVideo file="sess-1.mp4" />);

        expect(screen.getByTestId("session-video-probing")).toBeInTheDocument();
        expect(screen.getByTestId("session-video-panel").querySelector(".session-video-waiting")).toBeTruthy();
        expect(screen.queryByTestId("session-detail-video")).toBeNull();
    });

    it("mounts the player once HEAD succeeds", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200 }));

        render(<SessionVideo file="sess-1.mp4" />);

        await waitFor(() => {
            expect(screen.getByTestId("session-detail-video")).toBeInTheDocument();
        });
        expect(screen.queryByTestId("session-video-probing")).toBeNull();
    });
});
