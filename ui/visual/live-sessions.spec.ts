import { expect, test, type Page } from "@playwright/test";
import { MOCK_SESSION_ID } from "../src/lib/mockSessionMatrix";

const MOCK = "?mock=1";

async function freezeUi(page: Page) {
    await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation: none !important;
            caret-color: transparent !important;
            transition: none !important;
          }
        `,
    });
}

test.describe("mock live sessions visual", () => {
    test("pairwise list", async ({ page }) => {
        await page.goto(`${MOCK}#/sessions`);
        await expect(page.getByTestId("sessions-panel")).toBeVisible();
        await expect(page.locator(".session").first()).toBeVisible();
        await freezeUi(page);
        await expect(page.getByTestId("sessions-panel")).toHaveScreenshot("live-list.png");
    });

    test("max session — active VNC mock", async ({ page }) => {
        await page.goto(`${MOCK}#/sessions/${MOCK_SESSION_ID.max}`);
        await expect(page.getByTestId("session-page")).toBeVisible();
        await expect(page.getByTestId("mock-vnc-desktop")).toBeVisible();
        await freezeUi(page);
        await expect(page.getByTestId("session-page")).toHaveScreenshot("session-max.png");
    });

    test("freeze session — starting", async ({ page }) => {
        await page.goto(`${MOCK}#/sessions/${MOCK_SESSION_ID.freeze}`);
        await expect(page.getByTestId("session-page")).toBeVisible();
        await freezeUi(page);
        await expect(page.getByTestId("session-page")).toHaveScreenshot("session-freeze.png");
    });

    test("min session — no VNC", async ({ page }) => {
        await page.goto(`${MOCK}#/sessions/${MOCK_SESSION_ID.min}`);
        await expect(page.getByTestId("session-page")).toBeVisible();
        await expect(page.getByTestId("mock-vnc-desktop")).toHaveCount(0);
        await freezeUi(page);
        await expect(page.getByTestId("session-page")).toHaveScreenshot("session-min.png");
    });
});
