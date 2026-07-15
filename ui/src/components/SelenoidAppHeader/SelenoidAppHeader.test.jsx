import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../lib/remountDesignSystemHeader", () => ({
    remountDesignSystemHeader: vi.fn().mockResolvedValue(undefined),
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

import { SelenoidAppHeader } from "./index";

describe("SelenoidAppHeader", () => {
    it("renders AppHeader with three nav items when videos enabled", () => {
        render(<SelenoidAppHeader videos={true} />);

        const mount = screen.getByTestId("app-header-mount");
        expect(mount).toHaveAttribute("data-brand", "Selenoid UI");
        expect(mount).toHaveAttribute("data-nav-count", "3");
    });

    it("omits Videos nav when videos disabled", () => {
        render(<SelenoidAppHeader videos={false} />);

        expect(screen.getByTestId("app-header-mount")).toHaveAttribute("data-nav-count", "2");
    });
});
