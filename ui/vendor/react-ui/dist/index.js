// src/cn.ts
function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

// src/Badge.tsx
import { jsx } from "react/jsx-runtime";
var variantClass = {
  default: "badge",
  primary: "badge badge--primary"
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
  return code === "ru" ? "\u041F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043D\u0430 English" : "Switch to Russian";
}
function LangIcon() {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsx2("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ jsx2("path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" }),
        /* @__PURE__ */ jsx2("path", { d: "M2 12h20" })
      ]
    }
  );
}
function LangToggle({
  className,
  testId = "header-lang-toggle",
  labelTestId = "header-lang-label",
  defaultLang = "en",
  onLangChange
}) {
  const [lang, setLang] = useState(defaultLang);
  const toggle = useCallback(() => {
    setLang((current) => {
      const next = current === "ru" ? "en" : "ru";
      onLangChange?.(next);
      return next;
    });
  }, [onLangChange]);
  return /* @__PURE__ */ jsxs("span", { className: cn("lang-toggle", className), children: [
    /* @__PURE__ */ jsx2(
      "button",
      {
        type: "button",
        className: "icon-btn",
        "data-testid": testId,
        "data-lang": lang,
        "aria-label": langAriaLabel(lang),
        onClick: toggle,
        children: /* @__PURE__ */ jsx2("span", { className: "icon", "aria-hidden": "true", children: /* @__PURE__ */ jsx2(LangIcon, {}) })
      }
    ),
    /* @__PURE__ */ jsx2("span", { className: "lang-toggle__label", "data-testid": labelTestId, "aria-hidden": "true", children: langLabel(lang) })
  ] });
}

// src/Link.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
var variantClass2 = {
  default: "link",
  nav: "link link--nav"
};
function Link({
  variant = "default",
  active = false,
  className,
  children,
  "aria-current": ariaCurrent,
  ...rest
}) {
  return /* @__PURE__ */ jsx3(
    "a",
    {
      className: cn(variantClass2[variant], active && "is-active", className),
      "aria-current": active ? "page" : ariaCurrent,
      ...rest,
      children
    }
  );
}

// src/AppHeader.tsx
import { useEffect } from "react";
import { jsx as jsx4 } from "react/jsx-runtime";
function AppHeader({
  config,
  scriptSrc = "/js/header.js",
  mountId = "app-header"
}) {
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

// src/StatusTile.tsx
import { jsx as jsx5, jsxs as jsxs2 } from "react/jsx-runtime";
var statusToModifier = {
  ok: "connected",
  stale: "stale",
  error: "error",
  disconnected: "disconnected"
};
function StatusTile({
  label,
  state,
  status = "ok",
  variant = "tile",
  id,
  className,
  title,
  "aria-label": ariaLabel,
  "data-testid": dataTestId = "status-tile",
  ...rest
}) {
  const modifier = statusToModifier[status];
  return /* @__PURE__ */ jsxs2(
    "div",
    {
      id,
      role: "status",
      className: cn(
        "status-tile",
        `status-tile--${modifier}`,
        `status-tile--${variant}`,
        className
      ),
      "data-testid": dataTestId,
      title,
      "aria-label": ariaLabel ?? state,
      ...rest,
      children: [
        /* @__PURE__ */ jsx5("span", { className: "status-tile__label", children: label }),
        /* @__PURE__ */ jsx5("span", { className: "status-tile__state", children: state })
      ]
    }
  );
}

// src/SelenoidMetrics.tsx
import { jsx as jsx6, jsxs as jsxs3 } from "react/jsx-runtime";
function SelenoidMetrics({
  usedPercent,
  queued,
  quotaUsed,
  quotaPending,
  quotaTotal,
  variant = "header",
  className,
  "aria-label": ariaLabel = "Hub metrics",
  "data-testid": dataTestId = "selenoid-metrics",
  ...rest
}) {
  return /* @__PURE__ */ jsxs3(
    "div",
    {
      role: "group",
      className: cn("selenoid-metrics", `selenoid-metrics--${variant}`, className),
      "data-testid": dataTestId,
      "aria-label": ariaLabel,
      ...rest,
      children: [
        /* @__PURE__ */ jsxs3("div", { className: "selenoid-metrics__item", "data-testid": "selenoid-metrics-used", children: [
          /* @__PURE__ */ jsx6("span", { className: "selenoid-metrics__label", children: "Used" }),
          /* @__PURE__ */ jsxs3("span", { className: "selenoid-metrics__value", children: [
            usedPercent,
            /* @__PURE__ */ jsx6("span", { className: "selenoid-metrics__unit", children: "%" })
          ] })
        ] }),
        /* @__PURE__ */ jsx6("span", { className: "plaque-divider", "aria-hidden": "true" }),
        /* @__PURE__ */ jsxs3("div", { className: "selenoid-metrics__item", "data-testid": "selenoid-metrics-queued", children: [
          /* @__PURE__ */ jsx6("span", { className: "selenoid-metrics__label", children: "Queued" }),
          /* @__PURE__ */ jsx6("span", { className: "selenoid-metrics__value", children: queued })
        ] }),
        /* @__PURE__ */ jsx6("span", { className: "plaque-divider", "aria-hidden": "true" }),
        /* @__PURE__ */ jsxs3("div", { className: "selenoid-metrics__item", "data-testid": "selenoid-metrics-quota", children: [
          /* @__PURE__ */ jsx6("span", { className: "selenoid-metrics__label", children: "Quota" }),
          /* @__PURE__ */ jsxs3("span", { className: "selenoid-metrics__value", children: [
            quotaUsed,
            /* @__PURE__ */ jsx6("span", { className: "selenoid-metrics__quota-sep", children: " + " }),
            /* @__PURE__ */ jsx6("span", { className: "selenoid-metrics__quota-pending", children: quotaPending }),
            /* @__PURE__ */ jsx6("span", { className: "selenoid-metrics__quota-sep", children: " / " }),
            quotaTotal
          ] })
        ] })
      ]
    }
  );
}

// src/Button.tsx
import { jsx as jsx7 } from "react/jsx-runtime";
var variantClass3 = {
  primary: "btn--primary",
  secondary: "btn--secondary",
  ghost: "btn--ghost",
  danger: "btn--danger"
};
function Button({
  variant = "primary",
  block = false,
  className,
  children,
  type = "button",
  ...rest
}) {
  return /* @__PURE__ */ jsx7(
    "button",
    {
      type,
      className: cn("btn", variantClass3[variant], block && "btn--block", className),
      ...rest,
      children
    }
  );
}

// src/Input.tsx
import { forwardRef } from "react";
import { jsx as jsx8 } from "react/jsx-runtime";
var Input = forwardRef(function Input2({ className, ...rest }, ref) {
  return /* @__PURE__ */ jsx8("input", { ref, className: cn("input", className), ...rest });
});

// src/Panel.tsx
import { useLayoutEffect, useRef } from "react";
import { jsx as jsx9, jsxs as jsxs4 } from "react/jsx-runtime";
var WRAP = "panel__bar--wrap";
var WRAP_META = "panel__bar--wrap-meta";
var SLACK_ENTER = 1;
var SLACK_EXIT = 24;
function requiredWidth(parts, gap, pad) {
  return parts.reduce((sum, w) => sum + w, 0) + (parts.length - 1) * gap + pad;
}
function gapPx(styles) {
  const raw = styles.columnGap || styles.gap || "0";
  return parseFloat(String(raw).split(" ")[0]) || 0;
}
function tabsRowWidth(tabs) {
  const kids = tabs.children;
  const n = kids.length;
  if (!n) return 0;
  let w = 0;
  for (let i = 0; i < n; i++) w += kids[i].offsetWidth;
  const gap = gapPx(getComputedStyle(tabs));
  if (n > 1) w += (n - 1) * gap;
  return w;
}
function hysteretic(enter, exit, currentlyOn) {
  return currentlyOn ? exit : enter;
}
function panelBarMeasure(bar) {
  const dots = bar.querySelector(":scope > .panel__dots");
  const trail = bar.querySelector(":scope > .panel__trail");
  const tabs = trail?.querySelector(":scope > .tabs");
  if (!dots || !tabs) return null;
  const available = bar.clientWidth;
  if (available <= 0) return null;
  const meta = bar.querySelector(":scope > .panel__bar-end");
  const actionsEl = bar.querySelector(":scope > .panel__actions");
  const styles = getComputedStyle(bar);
  const pad = (parseFloat(styles.paddingLeft) || 0) + (parseFloat(styles.paddingRight) || 0);
  const gap = gapPx(styles);
  const chrome = [dots.offsetWidth];
  if (meta) chrome.push(meta.offsetWidth);
  if (actionsEl) chrome.push(actionsEl.offsetWidth);
  const full = chrome.slice();
  full.splice(1, 0, tabsRowWidth(tabs));
  return { available, pad, gap, chrome, full, hasMeta: Boolean(meta) };
}
function syncPanelBarWrap(bar) {
  if (!bar?.querySelector(":scope > .panel__trail > .tabs")) return;
  const m = panelBarMeasure(bar);
  if (!m) return;
  const metaNext = m.hasMeta ? hysteretic(
    requiredWidth(m.chrome, m.gap, m.pad) > m.available + SLACK_ENTER,
    requiredWidth(m.chrome, m.gap, m.pad) > m.available - SLACK_EXIT,
    bar.classList.contains(WRAP_META)
  ) : false;
  const wrapNext = metaNext || hysteretic(
    requiredWidth(m.full, m.gap, m.pad) > m.available + SLACK_ENTER,
    requiredWidth(m.full, m.gap, m.pad) > m.available - SLACK_EXIT,
    bar.classList.contains(WRAP)
  );
  if (bar.classList.contains(WRAP) !== wrapNext) bar.classList.toggle(WRAP, wrapNext);
  if (bar.classList.contains(WRAP_META) !== metaNext) {
    bar.classList.toggle(WRAP_META, metaNext);
  }
}
function Panel({
  title,
  children,
  variant = "content",
  tone = "dark",
  trail,
  foot,
  footPlacement = "bottom",
  barEnd,
  actions,
  testId,
  titleTestId,
  bodyClassName,
  hidden,
  className
}) {
  const hasActions = Boolean(actions && actions.length > 0);
  const barRef = useRef(null);
  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    syncPanelBarWrap(bar);
    if (typeof ResizeObserver === "undefined") return;
    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        syncPanelBarWrap(bar);
      });
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(bar);
    const panel = bar.closest(".panel");
    if (panel) ro.observe(panel);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [trail, barEnd, actions, title]);
  return /* @__PURE__ */ jsxs4(
    "div",
    {
      className: cn(
        "panel",
        `panel--${variant}`,
        variant === "terminal" && tone === "light" && "panel--terminal-light",
        foot != null && footPlacement === "rail" && "panel--foot-rail",
        className
      ),
      "data-testid": testId,
      hidden,
      children: [
        /* @__PURE__ */ jsxs4("div", { className: "panel__bar", ref: barRef, children: [
          /* @__PURE__ */ jsxs4("div", { className: "panel__dots", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsx9("span", { className: "panel__dot" }),
            /* @__PURE__ */ jsx9("span", { className: "panel__dot" }),
            /* @__PURE__ */ jsx9("span", { className: "panel__dot" })
          ] }),
          /* @__PURE__ */ jsxs4("div", { className: "panel__trail", children: [
            title != null && title !== "" ? /* @__PURE__ */ jsx9("span", { className: "panel__title", "data-testid": titleTestId, children: title }) : null,
            trail
          ] }),
          barEnd != null ? /* @__PURE__ */ jsx9("div", { className: "panel__bar-end", children: barEnd }) : null,
          hasActions ? /* @__PURE__ */ jsx9("div", { className: "panel__actions", children: actions.map((action, index) => /* @__PURE__ */ jsx9(
            "button",
            {
              type: "button",
              className: "icon-btn panel__action",
              "aria-label": action.label,
              title: action.label,
              disabled: action.disabled,
              "data-testid": action["data-testid"],
              onClick: action.onClick,
              children: /* @__PURE__ */ jsx9("span", { className: "icon", "aria-hidden": "true", children: action.icon })
            },
            action["data-testid"] ?? `${action.label}-${index}`
          )) }) : null
        ] }),
        /* @__PURE__ */ jsx9("div", { className: cn("panel__body", bodyClassName), children }),
        foot != null ? /* @__PURE__ */ jsx9("div", { className: "panel__foot", children: foot }) : null
      ]
    }
  );
}

// src/PlaqueField.tsx
import { jsx as jsx10, jsxs as jsxs5 } from "react/jsx-runtime";
function PlaqueField({
  label,
  className,
  divided = true,
  stretch = true,
  paramId,
  labelVariant = "caption",
  id,
  ...inputProps
}) {
  const labelClass = labelVariant === "param" ? "plaque-field__label" : "plaque-field__text";
  return /* @__PURE__ */ jsxs5(
    "label",
    {
      className: cn(
        "plaque-field",
        divided && "plaque-field--divided",
        stretch && "plaque-field--stretch",
        className
      ),
      "data-param-id": paramId,
      children: [
        /* @__PURE__ */ jsx10("span", { className: labelClass, title: labelVariant === "param" ? label : void 0, children: label }),
        divided ? /* @__PURE__ */ jsx10("span", { className: "plaque-divider", "aria-hidden": "true" }) : null,
        /* @__PURE__ */ jsx10(Input, { id, className: "plaque-field__control", ...inputProps })
      ]
    }
  );
}

// src/PlaqueSelect.tsx
import { jsx as jsx11, jsxs as jsxs6 } from "react/jsx-runtime";
function PlaqueSelect({
  label,
  value,
  defaultValue,
  options,
  onChange,
  paramId,
  disabled,
  stretch = true,
  id,
  "aria-label": ariaLabel,
  className,
  "data-testid": testId
}) {
  const handleChange = (event) => {
    onChange?.(event.target.value);
  };
  return /* @__PURE__ */ jsxs6(
    "label",
    {
      className: cn(
        "plaque-field",
        "plaque-field--divided",
        stretch && "plaque-field--stretch",
        className
      ),
      "data-param-id": paramId,
      "data-testid": testId,
      children: [
        /* @__PURE__ */ jsx11("span", { className: "plaque-field__label", title: label, children: label }),
        /* @__PURE__ */ jsx11("span", { className: "plaque-divider", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx11(
          "select",
          {
            id,
            className: "plaque-field__control",
            value,
            defaultValue: value === void 0 ? defaultValue : void 0,
            disabled,
            "aria-label": ariaLabel ?? label,
            onChange: handleChange,
            children: options.map((option) => /* @__PURE__ */ jsx11("option", { value: option.value, children: option.label ?? option.value }, option.value))
          }
        )
      ]
    }
  );
}

// src/PlaqueFieldSeg.tsx
import { useState as useState2 } from "react";
import { jsx as jsx12, jsxs as jsxs7 } from "react/jsx-runtime";
var DEFAULT_OPTIONS = [
  { value: "true" },
  { value: "false" }
];
function PlaqueFieldSeg({
  label,
  options = DEFAULT_OPTIONS,
  value,
  defaultValue,
  onValueChange,
  paramId,
  "aria-label": ariaLabel,
  className,
  "data-testid": testId
}) {
  const isControlled = value !== void 0;
  const [internalValue, setInternalValue] = useState2(
    () => defaultValue ?? options[0].value
  );
  const selected = isControlled ? value : internalValue;
  const select = (next) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };
  return /* @__PURE__ */ jsxs7(
    "div",
    {
      className: cn("plaque-field", "plaque-field--divided", className),
      "data-param-id": paramId,
      "data-testid": testId,
      children: [
        /* @__PURE__ */ jsx12("span", { className: "plaque-field__label", title: label, children: label }),
        /* @__PURE__ */ jsx12("span", { className: "plaque-divider", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx12("div", { className: "plaque-field-seg-track plaque-field-seg-track--many plaque-field__control", children: /* @__PURE__ */ jsx12("div", { className: "plaque-field-seg", role: "radiogroup", "aria-label": ariaLabel ?? label, children: options.map((option) => {
          const on = option.value === selected;
          return /* @__PURE__ */ jsx12(
            "button",
            {
              type: "button",
              className: cn("plaque-field-seg__btn", on && "plaque-field-seg__btn--on"),
              "data-value": option.value,
              "aria-pressed": on,
              title: option.title,
              onClick: () => select(option.value),
              children: option.label ?? option.value
            },
            option.value
          );
        }) }) })
      ]
    }
  );
}

// src/PlaqueTagstrip.tsx
import { jsx as jsx13, jsxs as jsxs8 } from "react/jsx-runtime";
function PlaqueTagstrip({
  label,
  options,
  values,
  onToggle,
  paramId,
  "aria-label": ariaLabel,
  className,
  "data-testid": testId
}) {
  return /* @__PURE__ */ jsxs8(
    "div",
    {
      className: cn("plaque-field", "plaque-field--divided", className),
      "data-param-id": paramId,
      "data-testid": testId,
      children: [
        /* @__PURE__ */ jsx13("span", { className: "plaque-field__label", title: label, children: label }),
        /* @__PURE__ */ jsx13("span", { className: "plaque-divider", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx13("div", { className: "plaque-field-seg-track plaque-field-seg-track--many plaque-field__control", children: /* @__PURE__ */ jsx13("div", { className: "plaque-field-seg", role: "group", "aria-label": ariaLabel ?? label, children: options.map((option) => {
          const on = values.includes(option.value);
          return /* @__PURE__ */ jsx13(
            "button",
            {
              type: "button",
              className: cn("plaque-field-seg__btn", on && "plaque-field-seg__btn--on"),
              "data-value": option.value,
              "aria-pressed": on,
              title: option.title,
              onClick: () => onToggle(option.value),
              children: option.label ?? option.value
            },
            option.value
          );
        }) }) })
      ]
    }
  );
}

// src/PlaqueFieldSegGrid.tsx
import { Children, isValidElement } from "react";

// src/usePlaqueFieldMagnet.ts
import { useEffect as useEffect2 } from "react";
var EMBED_MARKER = "data-plaque-magnet-embed";
function usePlaqueFieldMagnet({
  enabled = true,
  scriptSrc = "/js/plaque-field-magnet.js",
  syncKey
} = {}) {
  useEffect2(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }
    if (typeof window.syncPlaqueMagnetStacks === "function") {
      window.syncPlaqueMagnetStacks(document);
      return;
    }
    if (!document.querySelector(`script[${EMBED_MARKER}]`)) {
      const script = document.createElement("script");
      script.src = scriptSrc;
      script.setAttribute(EMBED_MARKER, "true");
      document.body.appendChild(script);
    }
  }, [enabled, scriptSrc, syncKey]);
}

// src/PlaqueFieldSegGrid.tsx
import { jsx as jsx14 } from "react/jsx-runtime";
function PlaqueFieldSegGrid({
  children,
  pair = false,
  wrapCells = true,
  magnet = false,
  magnetScriptSrc,
  "aria-label": ariaLabel,
  className,
  "data-testid": testId
}) {
  usePlaqueFieldMagnet({
    enabled: magnet,
    scriptSrc: magnetScriptSrc,
    syncKey: Children.count(children)
  });
  const cells = wrapCells ? Children.map(
    children,
    (child, index) => isValidElement(child) ? /* @__PURE__ */ jsx14("div", { className: "plaque-field-grid__cell", children: child }, child.key ?? index) : child
  ) : children;
  return /* @__PURE__ */ jsx14(
    "div",
    {
      className: cn(
        "plaque-field-grid",
        pair && "plaque-field-grid--mixed",
        pair && "plaque-field-grid--pair",
        className
      ),
      role: ariaLabel ? "group" : void 0,
      "aria-label": ariaLabel,
      "data-testid": testId,
      children: cells
    }
  );
}

// src/PlaqueFieldGrid.tsx
import { Children as Children2, isValidElement as isValidElement2 } from "react";
import { jsx as jsx15 } from "react/jsx-runtime";
function PlaqueFieldGrid({
  children,
  layout = "duo",
  cellSpan,
  wrapCells = true,
  stackMagnet = false,
  magnetScriptSrc,
  "aria-label": ariaLabel,
  className,
  "data-testid": testId
}) {
  usePlaqueFieldMagnet({
    enabled: stackMagnet,
    scriptSrc: magnetScriptSrc,
    syncKey: Children2.count(children)
  });
  const cellClass = cn("plaque-field-grid__cell", cellSpan && `plaque-field-grid__cell--${cellSpan}`);
  const cells = wrapCells ? Children2.map(
    children,
    (child, index) => isValidElement2(child) ? /* @__PURE__ */ jsx15("div", { className: cellClass, children: child }, child.key ?? index) : child
  ) : children;
  const grid = /* @__PURE__ */ jsx15(
    "div",
    {
      className: cn(
        "plaque-field-grid",
        "plaque-field-grid--mixed",
        `plaque-field-grid--${layout}`,
        className
      ),
      role: ariaLabel ? "group" : void 0,
      "aria-label": ariaLabel,
      "data-testid": testId,
      children: cells
    }
  );
  if (stackMagnet) {
    return /* @__PURE__ */ jsx15("div", { className: "plaque-field-grid-stack plaque-field-grid-stack--magnet", children: grid });
  }
  return grid;
}

// src/ThemeToggle.tsx
import { useCallback as useCallback2, useEffect as useEffect3, useState as useState3 } from "react";

// src/theme-icons.tsx
import { jsx as jsx16, jsxs as jsxs9 } from "react/jsx-runtime";
function ThemeIconSun() {
  return /* @__PURE__ */ jsxs9("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsx16("circle", { cx: "12", cy: "12", r: "4" }),
    /* @__PURE__ */ jsx16("path", { d: "M12 2v2" }),
    /* @__PURE__ */ jsx16("path", { d: "M12 20v2" }),
    /* @__PURE__ */ jsx16("path", { d: "M4.93 4.93l1.41 1.41" }),
    /* @__PURE__ */ jsx16("path", { d: "M17.66 17.66l1.41 1.41" }),
    /* @__PURE__ */ jsx16("path", { d: "M2 12h2" }),
    /* @__PURE__ */ jsx16("path", { d: "M20 12h2" }),
    /* @__PURE__ */ jsx16("path", { d: "M4.93 19.07l1.41-1.41" }),
    /* @__PURE__ */ jsx16("path", { d: "M17.66 6.34l1.41-1.41" })
  ] });
}
function ThemeIconMoon() {
  return /* @__PURE__ */ jsx16("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx16("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" }) });
}

// src/ThemeToggle.tsx
import { jsx as jsx17 } from "react/jsx-runtime";
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
function ThemeToggle({
  className,
  testId = "header-theme-toggle",
  storageKey = "zds-theme"
}) {
  const [theme, setTheme] = useState3(() => readTheme(storageKey));
  useEffect3(() => {
    applyTheme(theme);
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);
  const toggle = useCallback2(() => {
    setTheme((current) => current === "light" ? "dark" : "light");
  }, []);
  const isLight = theme === "light";
  return /* @__PURE__ */ jsx17(
    "button",
    {
      type: "button",
      className: cn("icon-btn", className),
      "data-testid": testId,
      "aria-label": isLight ? "Switch to dark theme" : "Switch to light theme",
      onClick: toggle,
      children: /* @__PURE__ */ jsx17("span", { className: "icon", "aria-hidden": "true", children: isLight ? /* @__PURE__ */ jsx17(ThemeIconSun, {}) : /* @__PURE__ */ jsx17(ThemeIconMoon, {}) })
    }
  );
}

// src/panel-icons.tsx
import { jsx as jsx18, jsxs as jsxs10 } from "react/jsx-runtime";
function IconReset() {
  return /* @__PURE__ */ jsxs10(
    "svg",
    {
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsx18("path", { d: "M2.5 8a5.5 5.5 0 1 0 5.5-5.5 6 6 0 0 0-4.1 1.83L2.5 3.5" }),
        /* @__PURE__ */ jsx18("path", { d: "M2.5 2.5v3h3" })
      ]
    }
  );
}
function IconCopy() {
  return /* @__PURE__ */ jsxs10("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ jsx18("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ jsx18(
      "path",
      {
        d: "M5 11H4a1.5 1.5 0 0 1-1.5-1.5V4A1.5 1.5 0 0 1 4 2.5h5.5A1.5 1.5 0 0 1 11 4v1",
        stroke: "currentColor",
        strokeWidth: "1.5"
      }
    )
  ] });
}
function IconDownload() {
  return /* @__PURE__ */ jsxs10(
    "svg",
    {
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        /* @__PURE__ */ jsx18("path", { d: "M8 2.5v7" }),
        /* @__PURE__ */ jsx18("path", { d: "m5.25 7 2.75 2.75L10.75 7" }),
        /* @__PURE__ */ jsx18("path", { d: "M3 11v1.5A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5V11" })
      ]
    }
  );
}

// src/WindowControl.tsx
import { jsx as jsx19 } from "react/jsx-runtime";
function WindowControl({
  as,
  tone = "neutral",
  sessionControl,
  className,
  children,
  ...rest
}) {
  const Component = as ?? "button";
  const buttonType = Component === "button" ? { type: "button" } : {};
  return /* @__PURE__ */ jsx19(
    Component,
    {
      ...buttonType,
      className: cn(
        "window-control",
        `window-control--${tone}`,
        sessionControl && "vnc-window__session-control",
        className
      ),
      ...rest,
      children: /* @__PURE__ */ jsx19("span", { className: "icon", "aria-hidden": "true", children })
    }
  );
}

// src/vnc-icons.tsx
import { jsx as jsx20, jsxs as jsxs11 } from "react/jsx-runtime";
function IconClose() {
  return /* @__PURE__ */ jsx20("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: /* @__PURE__ */ jsx20("path", { d: "m4 4 8 8M12 4l-8 8" }) });
}
function IconDocumentRemove() {
  return /* @__PURE__ */ jsxs11(
    "svg",
    {
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsx20("path", { d: "M4 2.5h5l3 3v8H4z" }),
        /* @__PURE__ */ jsx20("path", { d: "M9 2.5v3h3M6 10h4" })
      ]
    }
  );
}
function IconDotsHorizontal() {
  return /* @__PURE__ */ jsx20("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: /* @__PURE__ */ jsx20("path", { d: "M3 8h.01M8 8h.01M13 8h.01" }) });
}
function IconLock() {
  return /* @__PURE__ */ jsxs11(
    "svg",
    {
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsx20("rect", { x: "3.5", y: "7", width: "9", height: "6.5", rx: "1.5" }),
        /* @__PURE__ */ jsx20("path", { d: "M5.5 7V5a2.5 2.5 0 0 1 5 0v2" })
      ]
    }
  );
}
function IconUnlock() {
  return /* @__PURE__ */ jsxs11(
    "svg",
    {
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsx20("rect", { x: "3.5", y: "7", width: "9", height: "6.5", rx: "1.5" }),
        /* @__PURE__ */ jsx20("path", { d: "M10.5 7V5a2.5 2.5 0 0 0-4.75-1.1" })
      ]
    }
  );
}
function IconChevronUp() {
  return /* @__PURE__ */ jsx20(
    "svg",
    {
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ jsx20("path", { d: "m4 10 4-4 4 4" })
    }
  );
}
function IconChevronDown() {
  return /* @__PURE__ */ jsx20(
    "svg",
    {
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ jsx20("path", { d: "m4 6 4 4 4-4" })
    }
  );
}
function IconVncCopy() {
  return /* @__PURE__ */ jsxs11("svg", { viewBox: "0 0 16 16", fill: "none", children: [
    /* @__PURE__ */ jsx20("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ jsx20(
      "path",
      {
        d: "M5 11H4a1.5 1.5 0 0 1-1.5-1.5V4A1.5 1.5 0 0 1 4 2.5h5.5A1.5 1.5 0 0 1 11 4v1",
        stroke: "currentColor",
        strokeWidth: "1.5"
      }
    )
  ] });
}
function IconUpload() {
  return /* @__PURE__ */ jsxs11(
    "svg",
    {
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsx20("path", { d: "M8 10V3m0 0L5.25 5.75M8 3l2.75 2.75" }),
        /* @__PURE__ */ jsx20("path", { d: "M3 10v2.5A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5V10" })
      ]
    }
  );
}

// src/ConnectionStatus.tsx
import { jsx as jsx21 } from "react/jsx-runtime";
function ConnectionStatus({
  state,
  className,
  role = "status",
  "aria-label": ariaLabel,
  ...rest
}) {
  const glyph = state === "connected" ? null : state === "disconnected" ? /* @__PURE__ */ jsx21(IconDocumentRemove, {}) : /* @__PURE__ */ jsx21(IconDotsHorizontal, {});
  return /* @__PURE__ */ jsx21(
    "span",
    {
      role,
      "aria-label": ariaLabel ?? `VNC ${state}`,
      className: cn("connection-status", `connection-status--${state}`, className),
      ...rest,
      children: glyph && /* @__PURE__ */ jsx21("span", { className: "icon", "aria-hidden": "true", children: glyph })
    }
  );
}

// src/VncWindow.tsx
import { jsx as jsx22, jsxs as jsxs12 } from "react/jsx-runtime";
var defaultLabels = {
  back: "Back",
  lock: "Lock screen",
  unlock: "Unlock screen",
  enterFullscreen: "Enter fullscreen",
  exitFullscreen: "Exit fullscreen",
  copy: "Copy from Selenoid",
  paste: "Paste to Selenoid"
};
function VncWindow({
  state,
  fullscreen = false,
  unlocked = false,
  back,
  onBack,
  onToggleLock,
  onToggleFullscreen,
  onCopy,
  onPaste,
  children,
  labels,
  className,
  "data-testid": dataTestId = "vnc-window"
}) {
  const l = { ...defaultLabels, ...labels };
  const external = state === "connected" ? "" : `VNC ${state}`;
  const backControl = back ?? /* @__PURE__ */ jsx22(WindowControl, { tone: "danger", "aria-label": l.back, title: l.back, onClick: onBack, children: /* @__PURE__ */ jsx22(IconClose, {}) });
  return /* @__PURE__ */ jsxs12("div", { className: cn("vnc-window-frame", fullscreen && "vnc-window-frame--fullscreen"), children: [
    /* @__PURE__ */ jsxs12(
      "div",
      {
        className: cn(
          "panel",
          "panel--vnc",
          "vnc-window",
          `vnc-window--${state}`,
          fullscreen && "vnc-window--fullscreen",
          className
        ),
        "data-state": state,
        "data-testid": dataTestId,
        children: [
          /* @__PURE__ */ jsxs12("div", { className: "panel__bar", children: [
            /* @__PURE__ */ jsxs12("div", { className: "vnc-window__controls", children: [
              backControl,
              /* @__PURE__ */ jsx22(ConnectionStatus, { state }),
              /* @__PURE__ */ jsx22(
                WindowControl,
                {
                  tone: "info",
                  sessionControl: true,
                  "aria-label": unlocked ? l.lock : l.unlock,
                  title: unlocked ? l.lock : l.unlock,
                  onClick: onToggleLock,
                  children: unlocked ? /* @__PURE__ */ jsx22(IconUnlock, {}) : /* @__PURE__ */ jsx22(IconLock, {})
                }
              ),
              /* @__PURE__ */ jsx22(
                WindowControl,
                {
                  tone: "success",
                  sessionControl: true,
                  "aria-label": fullscreen ? l.exitFullscreen : l.enterFullscreen,
                  title: fullscreen ? l.exitFullscreen : l.enterFullscreen,
                  onClick: onToggleFullscreen,
                  children: fullscreen ? /* @__PURE__ */ jsx22(IconChevronDown, {}) : /* @__PURE__ */ jsx22(IconChevronUp, {})
                }
              )
            ] }),
            /* @__PURE__ */ jsxs12("div", { className: "vnc-window__actions", children: [
              /* @__PURE__ */ jsx22(WindowControl, { tone: "neutral", "aria-label": l.copy, title: l.copy, onClick: onCopy, children: /* @__PURE__ */ jsx22(IconVncCopy, {}) }),
              /* @__PURE__ */ jsx22(WindowControl, { tone: "neutral", "aria-label": l.paste, title: l.paste, onClick: onPaste, children: /* @__PURE__ */ jsx22(IconUpload, {}) })
            ] })
          ] }),
          /* @__PURE__ */ jsx22("div", { className: "vnc-window__screen", children: /* @__PURE__ */ jsx22("div", { className: "vnc-window__screen-mount", "aria-label": "noVNC mount point", children }) })
        ]
      }
    ),
    /* @__PURE__ */ jsx22("div", { className: "vnc-window__external-status", role: "status", "aria-live": "polite", children: external })
  ] });
}

// src/code-highlight.ts
var JSON_TOKEN = /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;
function escapeHtmlKeepQuotes(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function wrapToken(prefix, cls, text) {
  return `<span class="${prefix}-${cls}">${escapeHtml(text)}</span>`;
}
function highlightJson(json, options) {
  const prefix = options?.prefix ?? "ch-tok";
  let html = escapeHtmlKeepQuotes(json);
  html = html.replace(JSON_TOKEN, (match) => {
    let cls = `${prefix}-str`;
    if (/^"/.test(match)) {
      if (/:\s*$/.test(match)) {
        const key = match.replace(/:\s*$/, "");
        return `<span class="${prefix}-key">${key}</span><span class="${prefix}-punct">:</span>`;
      }
      cls = `${prefix}-str`;
    } else if (match === "true" || match === "false") {
      cls = `${prefix}-bool`;
    } else if (match === "null") {
      cls = `${prefix}-null`;
    } else {
      cls = `${prefix}-num`;
    }
    return `<span class="${cls}">${match}</span>`;
  });
  html = html.replace(/([{}\[\],])/g, (ch) => {
    return `<span class="${prefix}-punct">${ch}</span>`;
  });
  return html;
}
function highlightShellValue(value, prefix) {
  if (value === "true" || value === "false") {
    return wrapToken(prefix, "bool", value);
  }
  if (/^-?\d+(?:\.\d+)?$/.test(value)) {
    return wrapToken(prefix, "num", value);
  }
  return wrapToken(prefix, "str", value);
}
function highlightUrlToken(token, prefix) {
  const match = token.match(/^(["'])([a-z][\w+.-]*:\/\/)([^/?#]+)([^?#]*)(?:\?([^#]*))?(#.*)?\1$/i);
  if (!match) return null;
  const [, quote, protocol, host, path, query, hash = ""] = match;
  const queryHtml = query ? wrapToken(prefix, "punct", "?") + query.split("&").map((parameter) => {
    const separator = parameter.indexOf("=");
    if (separator < 0) return wrapToken(prefix, "key", parameter);
    return wrapToken(prefix, "key", parameter.slice(0, separator)) + wrapToken(prefix, "punct", "=") + wrapToken(prefix, "str", parameter.slice(separator + 1));
  }).join(wrapToken(prefix, "punct", "&")) : "";
  return wrapToken(prefix, "punct", quote) + wrapToken(prefix, "comment", protocol) + wrapToken(prefix, "cmd", host) + wrapToken(prefix, "str", path) + queryHtml + wrapToken(prefix, "comment", hash) + wrapToken(prefix, "punct", quote);
}
function highlightShellToken(token, prefix) {
  if (/^\s*#/.test(token)) {
    return wrapToken(prefix, "comment", token);
  }
  const highlightedUrl = highlightUrlToken(token, prefix);
  if (highlightedUrl) {
    return highlightedUrl;
  }
  if (/^'/.test(token)) {
    return wrapToken(prefix, "str", token);
  }
  if (/^\\/.test(token)) {
    return wrapToken(prefix, "punct", token);
  }
  if (/^-D/.test(token)) {
    const eq = token.indexOf("=");
    if (eq < 0) {
      return wrapToken(prefix, "key", token);
    }
    return wrapToken(prefix, "key", token.slice(0, eq)) + wrapToken(prefix, "punct", "=") + highlightShellValue(token.slice(eq + 1), prefix);
  }
  if (token === "curl") {
    return wrapToken(prefix, "cmd", token);
  }
  if (/^--/.test(token) || /^-[a-zA-Z]+$/.test(token) || /^(POST|GET|PUT|DELETE|PATCH|HEAD)$/.test(token) || token === "export" || token === "test" || token === "./gradlew" || token === "gradle" || token === "allurectl" || /^ALLURE_/.test(token) || token === "TEST_CASE_ID") {
    return wrapToken(prefix, "key", token);
  }
  return escapeHtml(token);
}
var SHELL_TOKEN = /["'](?:wss?|https?):\/\/[^"']*["']|'[^']*'|-D[\w.]+(?:=[^\s\\']*)?|--[\w-]+|\bcurl\b|\.\/gradlew|allurectl|\bgradle\b|\bexport\b|\btest\b|\b(?:POST|GET|PUT|DELETE|PATCH|HEAD)\b|\b(?:ALLURE_[A-Z_]+|TEST_CASE_ID)\b|-[a-zA-Z]+\b|\\\s*$|\s+#.*$/g;
function highlightShellLine(line, prefix) {
  if (/^\s*#/.test(line)) {
    return wrapToken(prefix, "comment", line);
  }
  let html = "";
  let last = 0;
  let match;
  SHELL_TOKEN.lastIndex = 0;
  while ((match = SHELL_TOKEN.exec(line)) !== null) {
    html += escapeHtml(line.slice(last, match.index));
    html += highlightShellToken(match[0], prefix);
    last = match.index + match[0].length;
  }
  html += escapeHtml(line.slice(last));
  return html;
}
function highlightShell(text, options) {
  const prefix = options?.prefix ?? "ch-tok";
  return String(text).split("\n").map((line) => highlightShellLine(line, prefix)).join("\n");
}
function tryHighlightCurlQuotedData(text, options) {
  const prefix = options?.prefix ?? "ch-tok";
  const lines = String(text).split("\n");
  const openIdx = lines.findIndex((line) => /(?:^|\s)-d\s*'/.test(line));
  if (openIdx < 0) return null;
  const openLine = lines[openIdx];
  const m = openLine.match(/^(.*-d\s*)'(.*)$/);
  if (!m) return null;
  const openWithoutQuote = m[1];
  const afterOpen = m[2];
  let jsonText;
  let closeIdx;
  const sameLineClose = afterOpen.indexOf("'");
  if (sameLineClose >= 0) {
    jsonText = afterOpen.slice(0, sameLineClose);
    closeIdx = openIdx;
  } else {
    const parts = [afterOpen];
    closeIdx = -1;
    for (let i = openIdx + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.endsWith("'")) {
        parts.push(line.slice(0, -1));
        closeIdx = i;
        break;
      }
      parts.push(line);
    }
    if (closeIdx < 0) return null;
    jsonText = parts.join("\n");
  }
  const openHl = highlightShellLine(openWithoutQuote, prefix) + wrapToken(prefix, "punct", "'");
  const body = highlightJson(jsonText, options);
  const closeQuote = wrapToken(prefix, "punct", "'");
  const head = lines.slice(0, openIdx).map((line) => highlightShellLine(line, prefix));
  const bodyLines = body.split("\n");
  if (closeIdx === openIdx || bodyLines.length === 1) {
    return [...head, openHl + body + closeQuote].join("\n");
  }
  const first = openHl + bodyLines[0];
  const mid = bodyLines.slice(1, -1);
  const last = bodyLines[bodyLines.length - 1] + closeQuote;
  return [...head, first, ...mid, last].join("\n");
}
function highlightCurlHeredoc(text, options) {
  return tryHighlightCurlQuotedData(text, options) ?? highlightShell(text, options);
}
function highlightMarkdown(text, options) {
  const prefix = options?.prefix ?? "ch-tok";
  const lines = String(text).split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const fenceOpen = line.match(/^```(\w*)\s*$/);
    if (fenceOpen) {
      out.push(wrapToken(prefix, "punct", line));
      i += 1;
      const body = [];
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      const lang = fenceOpen[1] || "";
      if (lang === "json" || body.length > 0 && /^\s*[{[]/.test(body[0])) {
        out.push(highlightJson(body.join("\n"), options));
      } else {
        out.push(...body.map((l) => escapeHtml(l)));
      }
      if (i < lines.length && /^```\s*$/.test(lines[i])) {
        out.push(wrapToken(prefix, "punct", lines[i]));
        i += 1;
      }
      continue;
    }
    out.push(highlightMarkdownLine(line, prefix));
    i += 1;
  }
  return out.join("\n");
}
function highlightMarkdownInline(text, prefix) {
  let html = "";
  let last = 0;
  const re = /`([^`]+)`|\*\*([^*]+)\*\*/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    html += escapeHtml(text.slice(last, match.index));
    if (match[1] != null) {
      html += wrapToken(prefix, "punct", "`");
      html += wrapToken(prefix, "str", match[1]);
      html += wrapToken(prefix, "punct", "`");
    } else {
      html += wrapToken(prefix, "punct", "**");
      html += wrapToken(prefix, "key", match[2]);
      html += wrapToken(prefix, "punct", "**");
    }
    last = match.index + match[0].length;
  }
  html += escapeHtml(text.slice(last));
  return html;
}
function highlightMarkdownLine(line, prefix) {
  if (/^#{1,6}\s/.test(line)) {
    const m = line.match(/^(#{1,6})(\s+)(.*)$/);
    if (!m) return escapeHtml(line);
    return wrapToken(prefix, "cmd", m[1]) + escapeHtml(m[2]) + highlightMarkdownInline(m[3], prefix);
  }
  if (/^-\s/.test(line)) {
    return wrapToken(prefix, "punct", "-") + highlightMarkdownInline(line.slice(1), prefix);
  }
  return highlightMarkdownInline(line, prefix);
}
function trimOutputBlankLines(text) {
  return String(text).replace(/^\n+/, "").replace(/\n+$/, "");
}
function highlightOutput(text, kind) {
  const trimmed = trimOutputBlankLines(text);
  switch (kind) {
    case "json":
      return highlightJson(trimmed);
    case "shell":
      return highlightShell(trimmed);
    case "curl":
      return highlightCurlHeredoc(trimmed);
    case "markdown":
      return highlightMarkdown(trimmed);
    case "plain":
    default:
      return escapeHtml(trimmed);
  }
}
function mountHighlightedOutput(el, text, kind = "json") {
  if (!el) return;
  el.classList.add("ch-code");
  el.innerHTML = highlightOutput(text, kind);
}
export {
  AppHeader,
  Badge,
  Button,
  ConnectionStatus,
  IconChevronDown,
  IconChevronUp,
  IconClose,
  IconCopy,
  IconDocumentRemove,
  IconDotsHorizontal,
  IconDownload,
  IconLock,
  IconReset,
  IconUnlock,
  IconUpload,
  IconVncCopy,
  Input,
  LangIcon,
  LangToggle,
  Link,
  Panel,
  PlaqueField,
  PlaqueFieldGrid,
  PlaqueFieldSeg,
  PlaqueFieldSegGrid,
  PlaqueSelect,
  PlaqueTagstrip,
  SelenoidMetrics,
  StatusTile,
  ThemeIconMoon,
  ThemeIconSun,
  ThemeToggle,
  VncWindow,
  WindowControl,
  escapeHtml,
  highlightCurlHeredoc,
  highlightJson,
  highlightMarkdown,
  highlightOutput,
  highlightShell,
  mountHighlightedOutput,
  trimOutputBlankLines,
  usePlaqueFieldMagnet
};
//# sourceMappingURL=index.js.map