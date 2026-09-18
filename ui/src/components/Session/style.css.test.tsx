import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "./session.css";

function styleRules(): CSSStyleRule[] {
    const out: CSSStyleRule[] = [];
    const walk = (list: CSSRuleList) => {
        for (const rule of [...list]) {
            if (rule instanceof CSSStyleRule) {
                out.push(rule);
            } else if ("cssRules" in rule) {
                try {
                    walk((rule as CSSGroupingRule).cssRules);
                } catch {
                    /* cross-origin / empty */
                }
            }
        }
    };
    for (const sheet of [...document.styleSheets]) {
        try {
            walk(sheet.cssRules);
        } catch {
            /* skip */
        }
    }
    return out;
}

function selectorsEndWith(rule: CSSStyleRule, suffix: string): boolean {
    return rule.selectorText.split(",").some((part) => part.trim().endsWith(suffix));
}

describe("session mosaic CSS", () => {
    it("compiled .session-media-slot is not a containing block; screen isolates noVNC", () => {
        render(
            <div className="session-page">
                <div className="session-media-slot" data-testid="slot">
                    <div className="vnc-window-frame vnc-window-frame--fullscreen">
                        <div className="vnc-window__screen" data-testid="screen" />
                    </div>
                </div>
            </div>
        );

        const slotRules = styleRules().filter((rule) => selectorsEndWith(rule, ".session-media-slot"));
        expect(slotRules.length).toBeGreaterThan(0);
        for (const rule of slotRules) {
            expect(rule.style.getPropertyValue("contain")).not.toMatch(/layout/);
            expect(rule.cssText).not.toMatch(/contain\s*:\s*[^;]*layout/);
        }

        const screenRules = styleRules().filter((rule) => selectorsEndWith(rule, ".vnc-window__screen"));
        expect(screenRules.some((rule) => /contain\s*:\s*[^;]*layout/.test(rule.cssText))).toBe(true);

        expect(getComputedStyle(screen.getByTestId("slot")).contain).not.toMatch(/layout/);
        expect(getComputedStyle(screen.getByTestId("screen")).contain).toMatch(/layout/);
        expect(getComputedStyle(document.querySelector(".session-page")!).display).toBe("flex");
        expect(getComputedStyle(document.querySelector(".session-page")!).flexDirection).toBe("column");
    });
});
