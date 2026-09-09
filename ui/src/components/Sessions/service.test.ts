import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { deleteSession, useSessionDelete } from "./service";
import { mergeOptimisticLiveSessions, resetOptimisticLiveSessions, seedOptimisticLiveSession } from "../../lib/optimisticLive";

describe("deleteSession", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        resetOptimisticLiveSessions();
    });

    it("resolves when hub DELETE is ok", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
        await expect(deleteSession("abc")).resolves.toBeUndefined();
    });

    it("resolves when hub DELETE is already gone", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
        await expect(deleteSession("abc")).resolves.toBeUndefined();
    });

    it("throws when hub DELETE is not ok", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
        await expect(deleteSession("abc")).rejects.toThrow("HTTP 500");
    });

    it("useSessionDelete hides the live id before hub DELETE returns", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
        seedOptimisticLiveSession("abc", { caps: { browserName: "chrome" } });
        const { result } = renderHook(() => useSessionDelete("abc"));
        await act(async () => {
            result.current[1]();
        });
        expect(mergeOptimisticLiveSessions({ abc: { caps: { browserName: "chrome" } } }).abc).toBeUndefined();
        await waitFor(() => {
            expect(result.current[0]).toBe(false);
        });
    });

    it("useSessionDelete logs a failed DELETE and clears the deleting flag", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
        const err = vi.spyOn(console, "error").mockImplementation(() => {});
        const { result } = renderHook(() => useSessionDelete("abc"));
        await act(async () => {
            result.current[1]();
        });
        await waitFor(() => {
            expect(result.current[0]).toBe(false);
        });
        expect(err).toHaveBeenCalled();
        expect(mergeOptimisticLiveSessions({ abc: { caps: { browserName: "chrome" } } }).abc).toBeTruthy();
    });
});
