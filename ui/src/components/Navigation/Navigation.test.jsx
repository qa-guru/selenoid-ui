import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HashRouter } from "react-router-dom";
import Navigation from "./index";

const links = [
    { href: "/", title: "STATS", exact: true },
    { href: "/capabilities/", title: "CAPABILITIES", exact: true },
    { href: "/videos", title: "VIDEOS", exact: true },
];

describe("Navigation", () => {
    it("renders route links", () => {
        render(
            <HashRouter>
                <Navigation links={links} />
            </HashRouter>
        );

        expect(screen.getByRole("link", { name: "STATS" })).toHaveAttribute("href", "#/");
        expect(screen.getByRole("link", { name: "CAPABILITIES" })).toHaveAttribute("href", "#/capabilities/");
        expect(screen.getByRole("link", { name: "VIDEOS" })).toHaveAttribute("href", "#/videos");
    });

    it("marks STATS as active on root route", () => {
        window.location.hash = "#/";
        render(
            <HashRouter>
                <Navigation links={links} />
            </HashRouter>
        );

        expect(screen.getByRole("link", { name: "STATS" })).toHaveClass("active");
    });
});
