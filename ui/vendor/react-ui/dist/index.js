// src/cn.ts
function cn(...parts) {
    return parts.filter(Boolean).join(" ");
}

// src/Badge.tsx
import { jsx } from "react/jsx-runtime";
var variantClass = {
    default: "badge",
    primary: "badge badge--primary",
};
function Badge({ variant = "default", className, children, ...rest }) {
    return /* @__PURE__ */ jsx("span", { className: cn(variantClass[variant], className), ...rest, children });
}

// src/LangToggle.tsx
import { useCallback, useState } from "react";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
function langLabel(code) {
    return code === "ru" ? "RU" : "EN";
}
function langAriaLabel(code) {
    return code === "ru"
        ? "\u041F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043D\u0430 English"
        : "Switch to Russian";
}
function LangIcon() {
    return /* @__PURE__ */ jsxs("svg", {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.6",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: [
            /* @__PURE__ */ jsx2("circle", { cx: "12", cy: "12", r: "10" }),
            /* @__PURE__ */ jsx2("path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" }),
            /* @__PURE__ */ jsx2("path", { d: "M2 12h20" }),
        ],
    });
}
function LangToggle({
    className,
    testId = "header-lang-toggle",
    labelTestId = "header-lang-label",
    defaultLang = "en",
    onLangChange,
}) {
    const [lang, setLang] = useState(defaultLang);
    const toggle = useCallback(() => {
        setLang((current) => {
            const next = current === "ru" ? "en" : "ru";
            onLangChange?.(next);
            return next;
        });
    }, [onLangChange]);
    return /* @__PURE__ */ jsxs("span", {
        className: cn("lang-toggle", className),
        children: [
            /* @__PURE__ */ jsx2("button", {
                type: "button",
                className: "icon-btn",
                "data-testid": testId,
                "data-lang": lang,
                "aria-label": langAriaLabel(lang),
                onClick: toggle,
                children: /* @__PURE__ */ jsx2("span", {
                    className: "icon",
                    "aria-hidden": "true",
                    children: /* @__PURE__ */ jsx2(LangIcon, {}),
                }),
            }),
            /* @__PURE__ */ jsx2("span", {
                className: "lang-toggle__label",
                "data-testid": labelTestId,
                "aria-hidden": "true",
                children: langLabel(lang),
            }),
        ],
    });
}

// src/Link.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
var variantClass2 = {
    default: "link",
    nav: "link link--nav",
};
function Link({ variant = "default", active = false, className, children, "aria-current": ariaCurrent, ...rest }) {
    return /* @__PURE__ */ jsx3("a", {
        className: cn(variantClass2[variant], active && "is-active", className),
        "aria-current": active ? "page" : ariaCurrent,
        ...rest,
        children,
    });
}

// src/AppHeader.tsx
import { useEffect } from "react";
import { jsx as jsx4 } from "react/jsx-runtime";
function AppHeader({ config, scriptSrc = "/js/header.js", mountId = "app-header" }) {
    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        window.headerConfig = config;
        if (!document.querySelector("script[data-header-embed]")) {
            const headerScript = document.createElement("script");
            headerScript.type = "module";
            headerScript.src = scriptSrc;
            headerScript.dataset.headerEmbed = "true";
            document.body.appendChild(headerScript);
        }
    }, [config, scriptSrc]);
    return /* @__PURE__ */ jsx4("div", { id: mountId, "data-testid": "app-header-mount" });
}

// src/Button.tsx
import { jsx as jsx5 } from "react/jsx-runtime";
var variantClass3 = {
    primary: "btn--primary",
    secondary: "btn--secondary",
    ghost: "btn--ghost",
    danger: "btn--danger",
};
function Button({ variant = "primary", block = false, className, children, type = "button", ...rest }) {
    return /* @__PURE__ */ jsx5("button", {
        type,
        className: cn("btn", variantClass3[variant], block && "btn--block", className),
        ...rest,
        children,
    });
}

// src/Input.tsx
import { forwardRef } from "react";
import { jsx as jsx6 } from "react/jsx-runtime";
var Input = forwardRef(function Input2({ className, ...rest }, ref) {
    return /* @__PURE__ */ jsx6("input", { ref, className: cn("input", className), ...rest });
});

// src/Panel.tsx
import { jsx as jsx7, jsxs as jsxs2 } from "react/jsx-runtime";
function Panel({ title, children, testId, titleTestId, bodyClassName, hidden, className }) {
    return /* @__PURE__ */ jsxs2("div", {
        className: cn("panel panel--content", className),
        "data-testid": testId,
        hidden,
        children: [
            /* @__PURE__ */ jsxs2("div", {
                className: "panel__bar",
                children: [
                    /* @__PURE__ */ jsxs2("div", {
                        className: "panel__dots",
                        "aria-hidden": "true",
                        children: [
                            /* @__PURE__ */ jsx7("span", { className: "panel__dot" }),
                            /* @__PURE__ */ jsx7("span", { className: "panel__dot" }),
                            /* @__PURE__ */ jsx7("span", { className: "panel__dot" }),
                        ],
                    }),
                    /* @__PURE__ */ jsx7("div", {
                        className: "panel__trail",
                        children: /* @__PURE__ */ jsx7("span", {
                            className: "panel__title",
                            "data-testid": titleTestId,
                            children: title,
                        }),
                    }),
                ],
            }),
            /* @__PURE__ */ jsx7("div", { className: cn("panel__body", bodyClassName), children }),
        ],
    });
}

// src/PlaqueField.tsx
import { jsx as jsx8, jsxs as jsxs3 } from "react/jsx-runtime";
function PlaqueField({ label, className, divided = true, stretch = true, id, ...inputProps }) {
    return /* @__PURE__ */ jsxs3("label", {
        className: cn(
            "plaque-field",
            divided && "plaque-field--divided",
            stretch && "plaque-field--stretch",
            className
        ),
        children: [
            /* @__PURE__ */ jsx8("span", { className: "plaque-field__text", children: label }),
            /* @__PURE__ */ jsx8(Input, { id, className: "plaque-field__control", ...inputProps }),
        ],
    });
}

// src/ThemeToggle.tsx
import { useCallback as useCallback2, useEffect as useEffect2, useState as useState2 } from "react";

// src/theme-icons.tsx
import { jsx as jsx9, jsxs as jsxs4 } from "react/jsx-runtime";
function ThemeIconSun() {
    return /* @__PURE__ */ jsxs4("svg", {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.6",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: [
            /* @__PURE__ */ jsx9("circle", { cx: "12", cy: "12", r: "4" }),
            /* @__PURE__ */ jsx9("path", { d: "M12 2v2" }),
            /* @__PURE__ */ jsx9("path", { d: "M12 20v2" }),
            /* @__PURE__ */ jsx9("path", { d: "M4.93 4.93l1.41 1.41" }),
            /* @__PURE__ */ jsx9("path", { d: "M17.66 17.66l1.41 1.41" }),
            /* @__PURE__ */ jsx9("path", { d: "M2 12h2" }),
            /* @__PURE__ */ jsx9("path", { d: "M20 12h2" }),
            /* @__PURE__ */ jsx9("path", { d: "M4.93 19.07l1.41-1.41" }),
            /* @__PURE__ */ jsx9("path", { d: "M17.66 6.34l1.41-1.41" }),
        ],
    });
}
function ThemeIconMoon() {
    return /* @__PURE__ */ jsx9("svg", {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.6",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: /* @__PURE__ */ jsx9("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" }),
    });
}

// src/ThemeToggle.tsx
import { jsx as jsx10 } from "react/jsx-runtime";
function readTheme(storageKey) {
    if (typeof document === "undefined") {
        return "dark";
    }
    const stored = localStorage.getItem(storageKey);
    if (stored === "light" || stored === "dark") {
        return stored;
    }
    return document.documentElement.classList.contains("theme-light") ? "light" : "dark";
}
function applyTheme(theme) {
    document.documentElement.classList.toggle("theme-light", theme === "light");
}
function ThemeToggle({ className, testId = "header-theme-toggle", storageKey = "zds-theme" }) {
    const [theme, setTheme] = useState2(() => readTheme(storageKey));
    useEffect2(() => {
        applyTheme(theme);
        localStorage.setItem(storageKey, theme);
    }, [theme, storageKey]);
    const toggle = useCallback2(() => {
        setTheme((current) => (current === "light" ? "dark" : "light"));
    }, []);
    const isLight = theme === "light";
    return /* @__PURE__ */ jsx10("button", {
        type: "button",
        className: cn("icon-btn", className),
        "data-testid": testId,
        "aria-label": isLight ? "Switch to dark theme" : "Switch to light theme",
        onClick: toggle,
        children: /* @__PURE__ */ jsx10("span", {
            className: "icon",
            "aria-hidden": "true",
            children: isLight ? /* @__PURE__ */ jsx10(ThemeIconSun, {}) : /* @__PURE__ */ jsx10(ThemeIconMoon, {}),
        }),
    });
}
export {
    AppHeader,
    Badge,
    Button,
    Input,
    LangIcon,
    LangToggle,
    Link,
    Panel,
    PlaqueField,
    ThemeIconMoon,
    ThemeIconSun,
    ThemeToggle,
};
//# sourceMappingURL=index.js.map
