import { expect, test, type Page } from "@playwright/test";
import { MOCK_SESSION_ID } from "../src/lib/mockSessionMatrix";

const MOCK = "?mock=1";

type Box = { x: number; y: number; width: number; height: number };

async function sessionPage(page: Page) {
    await page.goto(`${MOCK}#/sessions/${MOCK_SESSION_ID.max}`);
    await expect(page.getByTestId("session-page")).toBeVisible();
    await expect(page.getByTestId("vnc-window")).toBeVisible();
}

async function shell(page: Page) {
    return page.evaluate(() => {
        const header =
            parseFloat(getComputedStyle(document.body).paddingTop) ||
            parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-occupied-height")) ||
            40;
        return { w: window.innerWidth, h: window.innerHeight, header };
    });
}

function expectFillsViewport(box: Box, vp: { w: number; h: number; header: number }, label: string) {
    expect(box.width, `${label} width`).toBeGreaterThan(vp.w - 4);
    expect(box.height, `${label} height`).toBeGreaterThan(vp.h - vp.header - 8);
    expect(box.y, `${label} top (below header)`).toBeLessThanOrEqual(vp.header + 2);
    expect(box.x, `${label} left`).toBeLessThanOrEqual(2);
}

test.describe("session fullscreen geometry", () => {
    test("VNC fullscreen fills the viewport, not the mosaic cell", async ({ page }) => {
        await sessionPage(page);

        const slotContain = await page.locator(".session-media-slot").evaluate((el) => getComputedStyle(el).contain);
        expect(slotContain.split(/\s+/)).not.toContain("layout");

        const frame = page.locator(".vnc-window-frame");
        const before = await frame.boundingBox();
        expect(before).toBeTruthy();
        const vp = await shell(page);
        expect(before!.height, "mosaic cell is not already full-page").toBeLessThan(vp.h * 0.7);

        await page.getByTestId("vnc-window").getByRole("button", { name: "Enter fullscreen" }).click();
        await expect(page.getByTestId("vnc-window").getByRole("button", { name: "Exit fullscreen" })).toBeVisible();
        await expect(frame).toHaveClass(/vnc-window-frame--fullscreen/);

        const after = await frame.boundingBox();
        expect(after).toBeTruthy();
        expect(after!.height, "must grow out of the mosaic cell").toBeGreaterThan(before!.height + 80);
        expectFillsViewport(after!, vp, "VNC");
    });

    test("live log fullscreen fills the viewport", async ({ page }) => {
        await sessionPage(page);
        const host = page.locator(".session-peer").first();
        const before = await host.boundingBox();
        expect(before).toBeTruthy();
        const vp = await shell(page);
        expect(before!.height).toBeLessThan(vp.h * 0.7);

        await page.getByTestId("session-log-fullscreen").click();
        await expect(page.getByTestId("session-log-fullscreen")).toHaveAttribute("title", "Exit fullscreen");
        await expect(host).toHaveClass(/panel-host--fullscreen/);

        const after = await host.boundingBox();
        expect(after).toBeTruthy();
        expect(after!.height).toBeGreaterThan(before!.height + 80);
        expectFillsViewport(after!, vp, "log");
    });

    test("HAR fullscreen fills the viewport", async ({ page }) => {
        await sessionPage(page);
        const host = page.getByTestId("session-har-viewer");
        await expect(host).toBeVisible();
        const before = await host.boundingBox();
        expect(before).toBeTruthy();
        const vp = await shell(page);

        await page.getByTestId("session-har-fullscreen").click();
        await expect(page.getByTestId("session-har-fullscreen")).toHaveAttribute("title", "Exit fullscreen");
        await expect(host).toHaveClass(/panel-host--fullscreen/);

        const after = await host.boundingBox();
        expect(after).toBeTruthy();
        expect(after!.height).toBeGreaterThan(before!.height + 80);
        expectFillsViewport(after!, vp, "HAR");
    });
});
