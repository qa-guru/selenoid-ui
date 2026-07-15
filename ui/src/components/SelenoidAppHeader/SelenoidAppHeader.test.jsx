import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const remountDesignSystemHeader = vi.fn().mockResolvedValue(true);

vi.mock("../../lib/remountDesignSystemHeader", () => ({
    remountDesignSystemHeader: (...args) => remountDesignSystemHeader(...args),
}));

vi.mock("@zero-design-system/react", () => ({
    AppHeader: ({ config }) => (
        <div data-testid="app-header-mount" data-nav-count={config.nav?.length ?? 0} data-brand={config.brand?.label} />
    ),
}));

vi.mock("../../lib/syncHeaderHashNav", () => ({
    bindHeaderHashNav: vi.fn(() => () => {}),
    syncHeaderHashNav: vi.fn(),
}));

import { syncHeaderHashNav } from "../../lib/syncHeaderHashNav";
import { SelenoidAppHeader } from "./index";

describe("SelenoidAppHeader", () => {
    beforeEach(() => {
        remountDesignSystemHeader.mockClear();
        syncHeaderHashNav.mockClear();
    });

    it("renders AppHeader with three nav items when videos enabled", async () => {
        render(<SelenoidAppHeader videos={true} />);

        const mount = screen.getByTestId("app-header-mount");
        expect(mount).toHaveAttribute("data-brand", "Selenoid UI");
        expect(mount).toHaveAttribute("data-nav-count", "3");
        await waitFor(() => expect(remountDesignSystemHeader).toHaveBeenCalled());
        await waitFor(() => expect(syncHeaderHashNav).toHaveBeenCalled());
    });

    it("omits Videos nav when videos disabled", () => {
        render(<SelenoidAppHeader videos={false} />);

        expect(screen.getByTestId("app-header-mount")).toHaveAttribute("data-nav-count", "2");
    });
});
