import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { remountDesignSystemHeader } from "./remountDesignSystemHeader";

describe("remountDesignSystemHeader", () => {
    beforeEach(() => {
        delete window.__designSystemRemountHeader;
    });

    afterEach(() => {
        delete window.__designSystemRemountHeader;
        vi.useRealTimers();
    });

    it("calls remount when hook is already present", async () => {
        const remount = vi.fn().mockResolvedValue(undefined);
        window.__designSystemRemountHeader = remount;

        await expect(remountDesignSystemHeader({ timeoutMs: 100 })).resolves.toBe(true);
        expect(remount).toHaveBeenCalledTimes(1);
    });

    it("waits for late bridge hook instead of no-op", async () => {
        vi.useFakeTimers();
        const remount = vi.fn().mockResolvedValue(undefined);
        const pending = remountDesignSystemHeader({ timeoutMs: 1000, intervalMs: 50 });

        await vi.advanceTimersByTimeAsync(100);
        window.__designSystemRemountHeader = remount;
        await vi.advanceTimersByTimeAsync(100);

        await expect(pending).resolves.toBe(true);
        expect(remount).toHaveBeenCalledTimes(1);
    });

    it("returns false when hook never appears", async () => {
        await expect(remountDesignSystemHeader({ timeoutMs: 80, intervalMs: 20 })).resolves.toBe(false);
    });
});
