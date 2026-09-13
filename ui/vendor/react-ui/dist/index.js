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

// src/Chip.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
function Chip({
  active = false,
  static: isStatic = false,
  className,
  type = "button",
  disabled,
  children,
  ...rest
}) {
  const classNames = cn(
    "chip",
    active && "chip--active",
    isStatic && "chip--static",
    className
  );
  if (isStatic) {
    return /* @__PURE__ */ jsx2("span", { className: classNames, ...rest, children });
  }
  return /* @__PURE__ */ jsx2("button", { type, className: classNames, disabled, ...rest, children });
}

// src/LangToggle.tsx
import { useCallback, useEffect, useState } from "react";
import { jsx as jsx3, jsxs } from "react/jsx-runtime";
var HEADER_LANG_CHANGE = "header:lang-change";
var LANG_STORAGE_KEY = "zds-lang";
function langLabel(code) {
  return code === "ru" ? "RU" : "EN";
}
function langAriaLabel(code) {
  return code === "ru" ? "\u041F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043D\u0430 English" : "Switch to Russian";
}
function isLang(value) {
  return value === "en" || value === "ru";
}
function readLang(storageKey, fallback) {
  if (typeof document === "undefined") {
    return fallback;
  }
  try {
    const stored = localStorage.getItem(storageKey);
    if (isLang(stored)) {
      return stored;
    }
  } catch {
  }
  return fallback;
}
function persistLang(storageKey, lang) {
  try {
    localStorage.setItem(storageKey, lang);
  } catch {
  }
}
function applyLang(lang, storageKey) {
  document.documentElement.lang = lang;
  persistLang(storageKey, lang);
  document.dispatchEvent(new CustomEvent(HEADER_LANG_CHANGE, { detail: { lang } }));
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
        /* @__PURE__ */ jsx3("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ jsx3("path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" }),
        /* @__PURE__ */ jsx3("path", { d: "M2 12h20" })
      ]
    }
  );
}
function LangToggle({
  className,
  testId = "header-lang-toggle",
  labelTestId = "header-lang-label",
  defaultLang = "en",
  storageKey = LANG_STORAGE_KEY,
  onLangChange
}) {
  const [lang, setLang] = useState(() => readLang(storageKey, defaultLang));
  useEffect(() => {
    applyLang(lang, storageKey);
  }, [lang, storageKey]);
  const toggle = useCallback(() => {
    const next = lang === "ru" ? "en" : "ru";
    setLang(next);
    onLangChange?.(next);
  }, [lang, onLangChange]);
  return /* @__PURE__ */ jsxs("span", { className: cn("lang-toggle", className), children: [
    /* @__PURE__ */ jsx3(
      "button",
      {
        type: "button",
        className: "icon-btn",
        "data-testid": testId,
        "data-lang": lang,
        "aria-label": langAriaLabel(lang),
        onClick: toggle,
        children: /* @__PURE__ */ jsx3("span", { className: "icon", "aria-hidden": "true", children: /* @__PURE__ */ jsx3(LangIcon, {}) })
      }
    ),
    /* @__PURE__ */ jsx3("span", { className: "lang-toggle__label", "data-testid": labelTestId, "aria-hidden": "true", children: langLabel(lang) })
  ] });
}

// src/PollToggle.tsx
import { useCallback as useCallback2, useEffect as useEffect2, useRef, useState as useState2 } from "react";
import { jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
var POLL_DEFAULT_MS = 5e3;
function formatPollLabel(ms) {
  const safe = Number.isFinite(ms) && ms > 0 ? Math.round(ms) : POLL_DEFAULT_MS;
  if (safe % 1e3 === 0) return `${safe / 1e3}s`;
  return `${safe}ms`;
}
function PollIcon() {
  return /* @__PURE__ */ jsxs2(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsx4("path", { d: "M21 12a9 9 0 1 1-2.64-6.36" }),
        /* @__PURE__ */ jsx4("path", { d: "M21 3v6h-6" })
      ]
    }
  );
}
function PollToggle({
  className,
  testId = "poll-toggle",
  labelTestId,
  intervalMs = POLL_DEFAULT_MS,
  defaultOn = true,
  on: onProp,
  onTick,
  onChange,
  tickOnMount = false
}) {
  const [uncontrolledOn, setUncontrolledOn] = useState2(defaultOn);
  const on = onProp ?? uncontrolledOn;
  const label = formatPollLabel(intervalMs);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;
  const startedRef = useRef(false);
  useEffect2(() => {
    if (!on) {
      startedRef.current = false;
      return void 0;
    }
    if (tickOnMount && !startedRef.current) {
      startedRef.current = true;
      onTickRef.current?.();
    }
    const timer = window.setInterval(() => {
      onTickRef.current?.();
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [on, intervalMs, tickOnMount]);
  const toggle = useCallback2(() => {
    const next = !on;
    if (onProp === void 0) {
      setUncontrolledOn(next);
    }
    onChange?.(next);
    if (next) {
      onTickRef.current?.();
    }
  }, [on, onProp, onChange]);
  return /* @__PURE__ */ jsxs2("span", { className: cn("poll-toggle", on && "poll-toggle--on", className), "data-testid": testId, children: [
    /* @__PURE__ */ jsx4(
      "button",
      {
        type: "button",
        className: "icon-btn",
        "data-testid": `${testId}-btn`,
        "data-poll-ms": intervalMs,
        "aria-pressed": on,
        "aria-label": on ? `Stop auto-refresh (${label})` : `Start auto-refresh (${label})`,
        onClick: toggle,
        children: /* @__PURE__ */ jsx4("span", { className: "icon", "aria-hidden": "true", children: /* @__PURE__ */ jsx4(PollIcon, {}) })
      }
    ),
    /* @__PURE__ */ jsx4(
      "span",
      {
        className: "poll-toggle__label",
        "data-testid": labelTestId ?? `${testId}-label`,
        "aria-hidden": "true",
        children: label
      }
    )
  ] });
}

// src/Link.tsx
import { jsx as jsx5 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsx5(
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
import { useEffect as useEffect3 } from "react";
import { jsx as jsx6 } from "react/jsx-runtime";
function AppHeader({
  config,
  scriptSrc = "/js/header.js",
  mountId = "app-header"
}) {
  useEffect3(() => {
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
  return /* @__PURE__ */ jsx6("div", { id: mountId, "data-testid": "app-header-mount" });
}

// src/StatusTile.tsx
import { jsx as jsx7, jsxs as jsxs3 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs3(
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
        /* @__PURE__ */ jsx7("span", { className: "status-tile__label", children: label }),
        /* @__PURE__ */ jsx7("span", { className: "status-tile__state", children: state })
      ]
    }
  );
}

// src/SelenoidMetrics.tsx
import { jsx as jsx8, jsxs as jsxs4 } from "react/jsx-runtime";
function SelenoidMetrics({
  usedPercent,
  queued,
  warmReady,
  warmTotal,
  hotReady = 0,
  hotTotal = 0,
  quotaUsed,
  quotaPending,
  quotaTotal,
  variant = "header",
  className,
  "aria-label": ariaLabel = "Hub metrics",
  "data-testid": dataTestId = "selenoid-metrics",
  ...rest
}) {
  return /* @__PURE__ */ jsxs4(
    "div",
    {
      role: "group",
      className: cn("selenoid-metrics", `selenoid-metrics--${variant}`, className),
      "data-testid": dataTestId,
      "aria-label": ariaLabel,
      ...rest,
      children: [
        /* @__PURE__ */ jsxs4("div", { className: "selenoid-metrics__item", "data-testid": "selenoid-metrics-used", children: [
          /* @__PURE__ */ jsx8("span", { className: "selenoid-metrics__label", children: "Used" }),
          /* @__PURE__ */ jsxs4("span", { className: "selenoid-metrics__value", children: [
            usedPercent,
            /* @__PURE__ */ jsx8("span", { className: "selenoid-metrics__unit", children: "%" })
          ] })
        ] }),
        /* @__PURE__ */ jsx8("span", { className: "plaque-divider", "aria-hidden": "true" }),
        /* @__PURE__ */ jsxs4("div", { className: "selenoid-metrics__item", "data-testid": "selenoid-metrics-queued", children: [
          /* @__PURE__ */ jsx8("span", { className: "selenoid-metrics__label", children: "Queued" }),
          /* @__PURE__ */ jsx8("span", { className: "selenoid-metrics__value", children: queued })
        ] }),
        /* @__PURE__ */ jsx8("span", { className: "plaque-divider", "aria-hidden": "true" }),
        /* @__PURE__ */ jsxs4("div", { className: "selenoid-metrics__item", "data-testid": "selenoid-metrics-warm", children: [
          /* @__PURE__ */ jsx8("span", { className: "selenoid-metrics__label", children: "Warm" }),
          /* @__PURE__ */ jsxs4("span", { className: "selenoid-metrics__value", children: [
            warmReady,
            /* @__PURE__ */ jsx8("span", { className: "selenoid-metrics__quota-sep", children: " / " }),
            warmTotal
          ] })
        ] }),
        /* @__PURE__ */ jsx8("span", { className: "plaque-divider", "aria-hidden": "true" }),
        /* @__PURE__ */ jsxs4("div", { className: "selenoid-metrics__item", "data-testid": "selenoid-metrics-hot", children: [
          /* @__PURE__ */ jsx8("span", { className: "selenoid-metrics__label", children: "Hot" }),
          /* @__PURE__ */ jsxs4("span", { className: "selenoid-metrics__value", children: [
            hotReady,
            /* @__PURE__ */ jsx8("span", { className: "selenoid-metrics__quota-sep", children: " / " }),
            hotTotal
          ] })
        ] }),
        /* @__PURE__ */ jsx8("span", { className: "plaque-divider", "aria-hidden": "true" }),
        /* @__PURE__ */ jsxs4("div", { className: "selenoid-metrics__item", "data-testid": "selenoid-metrics-quota", children: [
          /* @__PURE__ */ jsx8("span", { className: "selenoid-metrics__label", children: "Quota" }),
          /* @__PURE__ */ jsxs4("span", { className: "selenoid-metrics__value", children: [
            quotaUsed,
            /* @__PURE__ */ jsx8("span", { className: "selenoid-metrics__quota-sep", children: " + " }),
            /* @__PURE__ */ jsx8("span", { className: "selenoid-metrics__quota-pending", children: quotaPending }),
            /* @__PURE__ */ jsx8("span", { className: "selenoid-metrics__quota-sep", children: " / " }),
            quotaTotal
          ] })
        ] })
      ]
    }
  );
}

// src/SelenoidDashboardRow.tsx
import { jsx as jsx9, jsxs as jsxs5 } from "react/jsx-runtime";
function SelenoidDashboardRow({
  sse,
  selenoid,
  metrics,
  className,
  "data-testid": dataTestId = "selenoid-dashboard-row",
  ...rest
}) {
  return /* @__PURE__ */ jsxs5(
    "div",
    {
      className: cn("selenoid-dashboard-row", className),
      "data-testid": dataTestId,
      ...rest,
      children: [
        /* @__PURE__ */ jsx9(StatusTile, { "data-testid": "sse-status", ...sse, variant: "tile" }),
        /* @__PURE__ */ jsx9(StatusTile, { "data-testid": "selenoid-status", ...selenoid, variant: "tile" }),
        /* @__PURE__ */ jsx9(SelenoidMetrics, { ...metrics, variant: "tile" })
      ]
    }
  );
}

// src/Button.tsx
import { jsx as jsx10 } from "react/jsx-runtime";
var variantClass3 = {
  primary: "btn--primary",
  secondary: "btn--secondary",
  ghost: "btn--ghost",
  danger: "btn--danger"
};
function Button({
  as,
  variant = "primary",
  block = false,
  className,
  children,
  ...rest
}) {
  const Component = as ?? "button";
  const buttonType = Component === "button" ? { type: "button" } : {};
  return /* @__PURE__ */ jsx10(
    Component,
    {
      ...buttonType,
      className: cn("btn", variantClass3[variant], block && "btn--block", className),
      ...rest,
      children
    }
  );
}

// src/SessionKill.tsx
import { jsx as jsx11, jsxs as jsxs6 } from "react/jsx-runtime";
function SessionKill({
  state = "live",
  stop,
  delete: deleteProps,
  close,
  finished,
  className,
  "data-testid": dataTestId,
  ...rest
}) {
  const isFinished = state === "finished";
  const hostTestId = dataTestId ?? (isFinished ? "session-kill-chrome-finished" : "session-kill-chrome");
  const {
    children: stopChildren,
    "data-testid": stopTestId,
    ...stopRest
  } = stop ?? {};
  const {
    children: deleteChildren,
    "data-testid": deleteTestId,
    ...deleteRest
  } = deleteProps ?? {};
  const {
    children: closeChildren,
    href: closeHref,
    className: closeClassName,
    "data-testid": closeTestId,
    ...closeRest
  } = close ?? {};
  const {
    children: finishedChildren,
    "data-testid": finishedTestId,
    ...finishedRest
  } = finished ?? {};
  return /* @__PURE__ */ jsxs6(
    "div",
    {
      className: cn("session-info__actions", className),
      "data-testid": hostTestId,
      ...rest,
      children: [
        isFinished ? /* @__PURE__ */ jsx11(
          Badge,
          {
            ...finishedRest,
            variant: "primary",
            "data-testid": finishedTestId ?? "session-finished",
            children: finishedChildren ?? "FINISHED"
          }
        ) : /* @__PURE__ */ jsx11(
          Button,
          {
            type: "button",
            ...stopRest,
            variant: "danger",
            "data-testid": stopTestId ?? "session-stop",
            children: stopChildren ?? "Stop session"
          }
        ),
        /* @__PURE__ */ jsx11(
          Button,
          {
            type: "button",
            ...deleteRest,
            variant: "danger",
            "data-testid": deleteTestId ?? (isFinished ? "session-delete-finished" : "session-delete"),
            children: deleteChildren ?? "Delete session"
          }
        ),
        /* @__PURE__ */ jsx11(
          "a",
          {
            ...closeRest,
            className: cn("btn", "btn--secondary", closeClassName),
            href: closeHref ?? "/sessions",
            "data-testid": closeTestId ?? (isFinished ? "session-close-finished" : "session-close"),
            children: closeChildren ?? "Close session window"
          }
        )
      ]
    }
  );
}

// src/Icon.tsx
import { jsx as jsx12 } from "react/jsx-runtime";
function Icon({ className, children, ...rest }) {
  return /* @__PURE__ */ jsx12("span", { className: cn("icon", className), ...rest, "aria-hidden": "true", children });
}

// src/IconBtn.tsx
import { jsx as jsx13 } from "react/jsx-runtime";
function IconBtn({
  as,
  className,
  children,
  ...rest
}) {
  const Component = as ?? "button";
  const buttonType = Component === "button" ? { type: "button" } : {};
  return /* @__PURE__ */ jsx13(Component, { ...buttonType, className: cn("icon-btn", className), ...rest, children: /* @__PURE__ */ jsx13("span", { className: "icon", "aria-hidden": "true", children }) });
}

// src/Input.tsx
import { forwardRef } from "react";
import { jsx as jsx14 } from "react/jsx-runtime";
var Input = forwardRef(function Input2({ className, ...rest }, ref) {
  return /* @__PURE__ */ jsx14("input", { ref, className: cn("input", className), ...rest });
});

// src/Select.tsx
import { forwardRef as forwardRef2 } from "react";
import { jsx as jsx15 } from "react/jsx-runtime";
var Select = forwardRef2(function Select2({ className, children, ...rest }, ref) {
  return /* @__PURE__ */ jsx15("select", { ref, className: cn("select", className), ...rest, children });
});

// src/Textarea.tsx
import { forwardRef as forwardRef3 } from "react";
import { jsx as jsx16 } from "react/jsx-runtime";
var Textarea = forwardRef3(function Textarea2({ className, ...rest }, ref) {
  return /* @__PURE__ */ jsx16("textarea", { ref, className: cn("textarea", className), ...rest });
});

// src/Checkbox.tsx
import { forwardRef as forwardRef4 } from "react";
import { jsx as jsx17, jsxs as jsxs7 } from "react/jsx-runtime";
var Checkbox = forwardRef4(function Checkbox2({ className, children, "data-testid": testId, ...rest }, ref) {
  return /* @__PURE__ */ jsxs7("label", { className: cn("checkbox", className), "data-testid": testId, children: [
    /* @__PURE__ */ jsx17("input", { ref, type: "checkbox", className: "checkbox__input", ...rest }),
    /* @__PURE__ */ jsx17("span", { children })
  ] });
});

// src/Radio.tsx
import { forwardRef as forwardRef5 } from "react";
import { jsx as jsx18, jsxs as jsxs8 } from "react/jsx-runtime";
var Radio = forwardRef5(function Radio2({ className, children, "data-testid": testId, ...rest }, ref) {
  return /* @__PURE__ */ jsxs8("label", { className: cn("radio", className), "data-testid": testId, children: [
    /* @__PURE__ */ jsx18("input", { ref, type: "radio", className: "radio__input", ...rest }),
    /* @__PURE__ */ jsx18("span", { children })
  ] });
});

// src/RadioCard.tsx
import { forwardRef as forwardRef6 } from "react";
import { jsx as jsx19, jsxs as jsxs9 } from "react/jsx-runtime";
function RadioGroup({
  title,
  className,
  children,
  ...rest
}) {
  return /* @__PURE__ */ jsxs9("div", { className: cn("radio-group", className), ...rest, children: [
    title != null ? /* @__PURE__ */ jsx19("h3", { className: "radio-group__title", children: title }) : null,
    /* @__PURE__ */ jsx19("div", { className: "stack stack--sm", children })
  ] });
}
var RadioCard = forwardRef6(function RadioCard2({
  className,
  children,
  muted = false,
  "data-testid": testId,
  inputTestId,
  ...rest
}, ref) {
  return /* @__PURE__ */ jsxs9(
    "label",
    {
      className: cn("radio-card", muted && "radio-card--muted", className),
      "data-testid": testId,
      children: [
        /* @__PURE__ */ jsx19(
          "input",
          {
            ref,
            type: "radio",
            className: "radio__input",
            "data-testid": inputTestId,
            ...rest
          }
        ),
        /* @__PURE__ */ jsx19("div", { className: "radio-card__body stack stack--sm", children })
      ]
    }
  );
});

// src/CheckboxCard.tsx
import { forwardRef as forwardRef7 } from "react";
import { jsx as jsx20, jsxs as jsxs10 } from "react/jsx-runtime";
function CheckboxGroup({
  title,
  className,
  children,
  ...rest
}) {
  return /* @__PURE__ */ jsxs10("div", { className: cn("checkbox-group", className), ...rest, children: [
    title != null ? /* @__PURE__ */ jsx20("h3", { className: "checkbox-group__title", children: title }) : null,
    /* @__PURE__ */ jsx20("div", { className: "stack stack--sm", children })
  ] });
}
var CheckboxCard = forwardRef7(function CheckboxCard2({
  className,
  children,
  muted = false,
  "data-testid": testId,
  inputTestId,
  ...rest
}, ref) {
  return /* @__PURE__ */ jsxs10(
    "label",
    {
      className: cn("checkbox-card", muted && "checkbox-card--muted", className),
      "data-testid": testId,
      children: [
        /* @__PURE__ */ jsx20(
          "input",
          {
            ref,
            type: "checkbox",
            className: "checkbox__input",
            "data-testid": inputTestId,
            ...rest
          }
        ),
        /* @__PURE__ */ jsx20("div", { className: "checkbox-card__body stack stack--sm", children })
      ]
    }
  );
});

// src/Panel.tsx
import { useLayoutEffect, useRef as useRef2 } from "react";
import { jsx as jsx21, jsxs as jsxs11 } from "react/jsx-runtime";
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
  barChrome = false,
  testId,
  titleTestId,
  bodyClassName,
  hidden,
  className
}) {
  const hasActions = Boolean(actions && actions.length > 0);
  const barRef = useRef2(null);
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
  return /* @__PURE__ */ jsxs11(
    "div",
    {
      className: cn(
        "panel",
        `panel--${variant}`,
        variant === "terminal" && tone === "light" && "panel--terminal-light",
        barChrome && "panel--bar-chrome",
        foot != null && footPlacement === "rail" && "panel--foot-rail",
        className
      ),
      "data-testid": testId,
      hidden,
      children: [
        /* @__PURE__ */ jsxs11("div", { className: "panel__bar", ref: barRef, children: [
          /* @__PURE__ */ jsxs11("div", { className: "panel__dots", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsx21("span", { className: "panel__dot" }),
            /* @__PURE__ */ jsx21("span", { className: "panel__dot" }),
            /* @__PURE__ */ jsx21("span", { className: "panel__dot" })
          ] }),
          /* @__PURE__ */ jsxs11("div", { className: "panel__trail", children: [
            title != null && title !== "" ? /* @__PURE__ */ jsx21("span", { className: "panel__title", "data-testid": titleTestId, children: title }) : null,
            trail
          ] }),
          barEnd != null ? /* @__PURE__ */ jsx21("div", { className: "panel__bar-end", children: barEnd }) : null,
          hasActions ? /* @__PURE__ */ jsx21("div", { className: "panel__actions", children: actions.map((action, index) => {
            const ActionTag = action.as ?? "button";
            const isButton = ActionTag === "button";
            return /* @__PURE__ */ jsx21(
              ActionTag,
              {
                ...isButton ? { type: "button", disabled: action.disabled } : { href: action.href, to: action.to },
                className: "icon-btn panel__action",
                "aria-label": action.label,
                title: action.label,
                "data-testid": action["data-testid"],
                onClick: action.onClick,
                children: /* @__PURE__ */ jsx21("span", { className: "icon", "aria-hidden": "true", children: action.icon })
              },
              action["data-testid"] ?? `${action.label}-${index}`
            );
          }) }) : null
        ] }),
        /* @__PURE__ */ jsx21("div", { className: cn("panel__body", bodyClassName), children }),
        foot != null ? /* @__PURE__ */ jsx21("div", { className: "panel__foot", children: foot }) : null
      ]
    }
  );
}

// src/Indicator.tsx
import { jsx as jsx22 } from "react/jsx-runtime";
function Indicator({
  tone = "neutral",
  solid = false,
  soft = false,
  className,
  ...rest
}) {
  return /* @__PURE__ */ jsx22(
    "span",
    {
      className: cn(
        "indicator",
        `indicator--${tone}`,
        solid && "indicator--solid",
        soft && "indicator--soft",
        className
      ),
      ...rest
    }
  );
}
function IndicatorRow({
  className,
  children,
  "aria-hidden": ariaHidden = true,
  ...rest
}) {
  return /* @__PURE__ */ jsx22(
    "div",
    {
      className: cn("indicator-row", className),
      "aria-hidden": ariaHidden,
      ...rest,
      children
    }
  );
}

// src/Callout.tsx
import { Children } from "react";
import { jsx as jsx23, jsxs as jsxs12 } from "react/jsx-runtime";
function Callout({
  tone,
  title,
  className,
  role = "status",
  children,
  ...rest
}) {
  const hasTitle = title != null && title !== "";
  const hasList = Children.toArray(children).length > 0;
  return /* @__PURE__ */ jsxs12(
    "div",
    {
      className: cn("callout", `callout--${tone}`, className),
      role,
      ...rest,
      children: [
        hasTitle ? /* @__PURE__ */ jsx23("p", { className: "callout__title", children: title }) : null,
        hasList ? /* @__PURE__ */ jsx23("ul", { className: "callout__list", children }) : null
      ]
    }
  );
}

// src/BrandLogo.tsx
import { Fragment, jsx as jsx24, jsxs as jsxs13 } from "react/jsx-runtime";
function BrandLogoMark() {
  return /* @__PURE__ */ jsxs13(
    "svg",
    {
      className: "brand-logo__mark",
      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ jsx24(
          "rect",
          {
            x: "1.6",
            y: "1.6",
            width: "20.8",
            height: "20.8",
            rx: "6.2",
            stroke: "currentColor",
            strokeWidth: "2.2"
          }
        ),
        /* @__PURE__ */ jsx24("rect", { x: "7", y: "7", width: "10", height: "10", rx: "3", fill: "currentColor" })
      ]
    }
  );
}
function BrandAttributionInner() {
  return /* @__PURE__ */ jsxs13(Fragment, { children: [
    /* @__PURE__ */ jsx24("span", { children: "by" }),
    /* @__PURE__ */ jsxs13("span", { className: "brand-attribution__name", children: [
      "qa",
      /* @__PURE__ */ jsx24("span", { className: "brand-attribution__dot", children: "." }),
      "guru"
    ] })
  ] });
}
function BrandLogo({
  href,
  endorsed = false,
  size,
  word = "Selenoid",
  ver = "3",
  className,
  style,
  "aria-label": ariaLabel,
  ...rest
}) {
  const name = `${word} ${ver}`;
  const testId = endorsed ? void 0 : "brand-logo";
  const logoStyle = size != null || style ? {
    ...size != null ? { ["--brand-logo-size"]: `${size}px` } : {},
    ...style
  } : void 0;
  const classNames = cn(
    "brand-logo",
    endorsed && "brand-logo--endorsed",
    "brand-logo-link",
    className
  );
  const content = /* @__PURE__ */ jsxs13(Fragment, { children: [
    /* @__PURE__ */ jsx24(BrandLogoMark, {}),
    /* @__PURE__ */ jsxs13(
      "span",
      {
        className: "brand-logo__copy",
        "aria-hidden": endorsed ? true : void 0,
        children: [
          /* @__PURE__ */ jsxs13("span", { className: "brand-logo__word", children: [
            word,
            /* @__PURE__ */ jsx24("span", { className: "brand-logo__ver", children: ver })
          ] }),
          endorsed ? /* @__PURE__ */ jsx24("span", { className: "brand-attribution", children: /* @__PURE__ */ jsx24(BrandAttributionInner, {}) }) : null
        ]
      }
    )
  ] });
  const rootProps = {
    "data-testid": testId,
    ...rest,
    className: classNames,
    style: logoStyle,
    "aria-label": ariaLabel ?? (endorsed ? `${name} by qa.guru` : name)
  };
  if (href != null) {
    return /* @__PURE__ */ jsx24("a", { ...rootProps, href, children: content });
  }
  return /* @__PURE__ */ jsx24("span", { ...rootProps, children: content });
}
function BrandAttribution({
  size,
  className,
  style,
  "aria-label": ariaLabel = "by qa.guru",
  ...rest
}) {
  const attributionStyle = size != null || style ? {
    ...size != null ? { fontSize: `${size}px` } : {},
    ...style
  } : void 0;
  return /* @__PURE__ */ jsx24(
    "span",
    {
      ...rest,
      className: cn("brand-attribution", className),
      "aria-label": ariaLabel,
      style: attributionStyle,
      children: /* @__PURE__ */ jsx24(BrandAttributionInner, {})
    }
  );
}

// src/AllureLogo.tsx
import { jsx as jsx25 } from "react/jsx-runtime";
var ALLURE_LOGO = {
  "allure-1": {
    alt: "Allure 1",
    testId: "allure-logo-allure-1",
    width: 36
  },
  "allure-2": {
    alt: "Allure 2",
    testId: "allure-logo-allure-2",
    width: 32
  },
  "allure-3": {
    alt: "Allure 3",
    testId: "allure-logo-allure-3",
    width: 32
  },
  "allure-testops": {
    alt: "Allure TestOps",
    testId: "allure-logo-allure-testops",
    width: 32
  },
  "testops-ru": {
    alt: "\u0422\u0435\u0441\u0442\u041E\u043F\u0441",
    testId: "allure-logo-testops-ru",
    width: 32
  }
};
function AllureLogo({
  variant,
  src,
  className,
  alt,
  width,
  height,
  ...rest
}) {
  const meta = ALLURE_LOGO[variant];
  return /* @__PURE__ */ jsx25(
    "img",
    {
      "data-testid": meta.testId,
      ...rest,
      className: cn("allure-logo", `allure-logo--${variant}`, className),
      src,
      alt: alt ?? meta.alt,
      width: width ?? meta.width,
      height: height ?? 32
    }
  );
}

// src/QaGuruLogo.tsx
import { jsx as jsx26 } from "react/jsx-runtime";
function QaGuruLogo({
  src,
  size,
  className,
  alt,
  width,
  height,
  style,
  "aria-hidden": ariaHidden,
  ...rest
}) {
  const px = size ?? 32;
  const decorative = size === 24 || size === 16;
  const resolvedAlt = alt ?? (decorative ? "" : "qa.guru");
  const testId = size == null ? "qa-guru-logo" : size === 32 ? "qa-guru-logo-32" : void 0;
  const logoStyle = size != null || style ? {
    ...size != null ? { ["--qa-guru-logo-size"]: `${size}px` } : {},
    ...style
  } : void 0;
  return /* @__PURE__ */ jsx26(
    "img",
    {
      "data-testid": testId,
      ...rest,
      className: cn("qa-guru-logo", className),
      src,
      alt: resolvedAlt,
      width: width ?? px,
      height: height ?? px,
      "aria-hidden": ariaHidden ?? (decorative && resolvedAlt === "" ? true : void 0),
      style: logoStyle
    }
  );
}

// src/Stack.tsx
import { jsx as jsx27 } from "react/jsx-runtime";
function Stack({
  gap,
  row = false,
  className,
  children,
  ...rest
}) {
  return /* @__PURE__ */ jsx27(
    "div",
    {
      className: cn(
        "stack",
        gap === "sm" && "stack--sm",
        gap === "lg" && "stack--lg",
        row && "stack--row",
        className
      ),
      ...rest,
      children
    }
  );
}

// src/Grid.tsx
import { jsx as jsx28 } from "react/jsx-runtime";
function Grid({ layout, className, children, ...rest }) {
  return /* @__PURE__ */ jsx28("div", { className: cn("grid", `grid--${layout}`, className), ...rest, children });
}

// src/Section.tsx
import { Children as Children2 } from "react";
import { jsx as jsx29, jsxs as jsxs14 } from "react/jsx-runtime";
function Section({
  title,
  description,
  sticky = false,
  titleAs = "h2",
  className,
  children,
  ...rest
}) {
  const Heading = titleAs;
  const hasTitle = title != null && title !== "";
  const hasDescription = description != null && description !== "";
  const hasBody = Children2.toArray(children).length > 0;
  return /* @__PURE__ */ jsxs14(
    "section",
    {
      className: cn("section", sticky && "section--sticky", className),
      ...rest,
      children: [
        hasTitle ? /* @__PURE__ */ jsx29(Heading, { className: "section__title", children: title }) : null,
        hasDescription ? /* @__PURE__ */ jsx29("p", { className: "section__desc", children: description }) : null,
        hasBody ? /* @__PURE__ */ jsx29("div", { className: "section__body", children }) : null
      ]
    }
  );
}

// src/Text.tsx
import { jsx as jsx30 } from "react/jsx-runtime";
function Text({
  muted = false,
  sm = false,
  as = "p",
  className,
  children,
  ...rest
}) {
  const Component = as;
  return /* @__PURE__ */ jsx30(
    Component,
    {
      className: cn(
        "text",
        muted && "text--muted",
        sm && "text--sm",
        className
      ),
      ...rest,
      children
    }
  );
}

// src/Status.tsx
import { jsx as jsx31 } from "react/jsx-runtime";
function Status({
  as = "p",
  className,
  children,
  ...rest
}) {
  const Component = as;
  return /* @__PURE__ */ jsx31(Component, { className: cn("status", className), ...rest, children });
}

// src/Label.tsx
import { jsx as jsx32 } from "react/jsx-runtime";
function Label({ className, children, ...rest }) {
  return /* @__PURE__ */ jsx32("label", { className: cn("label", className), ...rest, children });
}

// src/FieldCaption.tsx
import { jsx as jsx33, jsxs as jsxs15 } from "react/jsx-runtime";
function FieldCaption({
  caption,
  className,
  children,
  ...rest
}) {
  const hasCaption = caption != null && caption !== "";
  return /* @__PURE__ */ jsxs15("div", { className: cn("field-caption", className), ...rest, children: [
    children,
    hasCaption ? /* @__PURE__ */ jsx33("p", { className: "field-caption__text", children: caption }) : null
  ] });
}

// src/Tab.tsx
import { jsx as jsx34 } from "react/jsx-runtime";
function Tabs({
  className,
  children,
  role = "tablist",
  ...rest
}) {
  return /* @__PURE__ */ jsx34("div", { className: cn("tabs", className), role, ...rest, children });
}
function Tab({
  active = false,
  className,
  type = "button",
  children,
  role = "tab",
  "aria-selected": ariaSelected,
  ...rest
}) {
  return /* @__PURE__ */ jsx34(
    "button",
    {
      type,
      className: cn("tab", active && "tab--active", className),
      role,
      "aria-selected": ariaSelected ?? active,
      ...rest,
      children
    }
  );
}

// src/SegmentedControl.tsx
import { jsx as jsx35 } from "react/jsx-runtime";
function SegmentedControl({
  className,
  children,
  ...rest
}) {
  return /* @__PURE__ */ jsx35("div", { className: cn("segmented-control", className), ...rest, children });
}
function SegmentedControlBtn({
  active = false,
  className,
  type = "button",
  children,
  ...rest
}) {
  return /* @__PURE__ */ jsx35(
    "button",
    {
      type,
      className: cn(
        "segmented-control__btn",
        active && "segmented-control__btn--active",
        className
      ),
      ...rest,
      children
    }
  );
}

// src/PlaqueDivider.tsx
import { jsx as jsx36 } from "react/jsx-runtime";
function PlaqueDivider({
  horizontal = false,
  className,
  ...rest
}) {
  return /* @__PURE__ */ jsx36(
    "span",
    {
      className: cn(
        "plaque-divider",
        horizontal && "plaque-divider--horizontal",
        className
      ),
      ...rest,
      "aria-hidden": "true"
    }
  );
}

// src/ChartTile.tsx
import { jsx as jsx37, jsxs as jsxs16 } from "react/jsx-runtime";
function ChartTile({
  title,
  className,
  children,
  bodyId,
  bodyTestId,
  ...rest
}) {
  return /* @__PURE__ */ jsxs16("div", { className: cn("chart-tile", className), ...rest, children: [
    /* @__PURE__ */ jsx37("h3", { className: "chart-tile__title", children: title }),
    /* @__PURE__ */ jsx37("div", { className: "chart-tile__body", id: bodyId, "data-testid": bodyTestId, children })
  ] });
}

// src/WidgetTile.tsx
import { jsx as jsx38, jsxs as jsxs17 } from "react/jsx-runtime";
function WidgetTile({
  title,
  children,
  chart,
  dots,
  bleed = false,
  tier,
  layout,
  span,
  className,
  ...rest
}) {
  const hasDots = dots != null && dots.length > 0;
  return /* @__PURE__ */ jsxs17(
    "figure",
    {
      className: cn(
        "widget-tile",
        bleed && "widget-tile--bleed",
        tier && `widget-tile--tier-${tier}`,
        layout && `widget-tile--layout-${layout}`,
        span && `widget-tile--span-${span}`,
        className
      ),
      ...rest,
      ...chart != null ? { "data-chart": chart } : null,
      children: [
        /* @__PURE__ */ jsxs17("div", { className: "widget-tile__bar", children: [
          hasDots ? /* @__PURE__ */ jsx38(IndicatorRow, { children: dots.map((dot, index) => /* @__PURE__ */ jsx38(Indicator, { tone: `status-${dot}` }, `${dot}-${index}`)) }) : null,
          /* @__PURE__ */ jsx38("span", { className: "widget-tile__title", children: title })
        ] }),
        /* @__PURE__ */ jsx38("div", { className: "widget-tile__body", children })
      ]
    }
  );
}

// src/WidgetMosaic.tsx
import { jsx as jsx39 } from "react/jsx-runtime";
function WidgetMosaic({
  children,
  columns,
  post = false,
  postSquare = false,
  substrate,
  className,
  ...rest
}) {
  return /* @__PURE__ */ jsx39(
    "section",
    {
      className: cn(
        "widget-mosaic",
        (columns === 2 || columns === 3) && `widget-mosaic--${columns}`,
        post && "widget-mosaic--post",
        postSquare && "widget-mosaic--post-square",
        substrate != null && `widget-mosaic--post-${substrate}`,
        className
      ),
      "aria-label": "Dashboard mosaic",
      ...rest,
      children
    }
  );
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

// src/CodeHighlight.tsx
import { jsx as jsx40 } from "react/jsx-runtime";
var DEFAULT_LABEL = {
  json: "JSON",
  shell: "Shell",
  curl: "curl",
  markdown: "Markdown",
  plain: "Code"
};
function CodeHighlight({
  code,
  kind = "json",
  plain = false,
  className,
  ...rest
}) {
  const highlightKind = plain ? "plain" : kind;
  const isPlain = plain || kind === "plain";
  return /* @__PURE__ */ jsx40(
    "pre",
    {
      className: cn("ch-code", isPlain && "ch-code--plain", className),
      "aria-label": DEFAULT_LABEL[kind],
      ...rest,
      dangerouslySetInnerHTML: {
        __html: highlightOutput(code, highlightKind)
      }
    }
  );
}

// ../design-system/js/dom-utils.js
function escapeHtml2(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ../design-system/js/sparkline.js
var DEFAULT_EMPTY_LABEL = {
  en: "No history",
  ru: "\u041D\u0435\u0442 \u0438\u0441\u0442\u043E\u0440\u0438\u0438"
};
function resolveSparklineEmptyLabel(lang = "ru") {
  return DEFAULT_EMPTY_LABEL[lang] ?? DEFAULT_EMPTY_LABEL.en;
}
function statusSparkColor(status, theme) {
  const normalized = (status || "unknown").toLowerCase();
  if (normalized === "passed") return theme.pass;
  if (normalized === "failed") return theme.fail;
  if (normalized === "broken") return theme.broken;
  return theme.skip;
}
function sparklineThemeFromSite(siteTheme) {
  const isDark = siteTheme === "dark";
  return {
    accent: isDark ? "#38bdf8" : "#20aee3",
    pass: isDark ? "#4ade80" : "#16a34a",
    fail: isDark ? "#f87171" : "#dc2626",
    broken: isDark ? "#fbbf24" : "#d97706",
    skip: isDark ? "#94a3b8" : "#64748b"
  };
}
function buildSparkline(history, theme, options = {}) {
  const lang = options.lang ?? "ru";
  const emptyLabel = options.emptyLabel ?? resolveSparklineEmptyLabel(lang);
  const points = (history ?? []).filter((point) => typeof point.durationSec === "number");
  if (points.length < 2) {
    const empty = document.createElement("span");
    empty.className = "sparkline sparkline--empty";
    empty.textContent = emptyLabel;
    return empty;
  }
  const values = points.map((point) => point.durationSec);
  const width = options.width ?? 88;
  const height = options.height ?? 28;
  const padX = 0;
  const padY = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const coords = values.map((value, index) => {
    const x = padX + index / (values.length - 1) * (width - padX * 2);
    const y = padY + (1 - (value - min) / range) * (height - padY * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const polyline = coords.join(" ");
  const area = `${padX},${height - padY} ${polyline} ${width - padX},${height - padY}`;
  const label = values.map((value, index) => `R${index + 1}: ${value.toFixed(2)}s`).join(" \xB7 ");
  const stroke = options.stroke ?? theme.accent;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "sparkline sparkline--duration");
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", label);
  const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
  title.textContent = label;
  svg.append(title);
  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygon.setAttribute("class", "sparkline__area");
  polygon.setAttribute("points", area);
  polygon.setAttribute("fill", stroke);
  polygon.setAttribute("fill-opacity", "0.14");
  const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  line.setAttribute("class", "sparkline__line");
  line.setAttribute("points", polyline);
  line.setAttribute("fill", "none");
  line.setAttribute("stroke", stroke);
  line.setAttribute("stroke-width", "1.5");
  line.setAttribute("stroke-linecap", "round");
  line.setAttribute("stroke-linejoin", "round");
  svg.append(polygon, line);
  return svg;
}

// src/Sparkline.tsx
import { jsx as jsx41, jsxs as jsxs18 } from "react/jsx-runtime";
function siteSparklineTheme() {
  const site = typeof document !== "undefined" && document.documentElement.classList.contains("theme-light") ? "light" : "dark";
  return sparklineThemeFromSite(site);
}
function Sparkline({
  history,
  theme,
  lang = "ru",
  width = 88,
  height = 28,
  className,
  ...rest
}) {
  const node = buildSparkline(history, theme ?? siteSparklineTheme(), {
    lang,
    width,
    height
  });
  const rootClass = cn(node.getAttribute("class") ?? void 0, className);
  if (node.tagName === "SPAN") {
    return /* @__PURE__ */ jsx41("span", { className: rootClass, ...rest, children: node.textContent });
  }
  const title = node.querySelector("title");
  const area = node.querySelector(".sparkline__area");
  const line = node.querySelector(".sparkline__line");
  return /* @__PURE__ */ jsxs18(
    "svg",
    {
      className: rootClass,
      width: node.getAttribute("width") ?? void 0,
      height: node.getAttribute("height") ?? void 0,
      viewBox: node.getAttribute("viewBox") ?? void 0,
      preserveAspectRatio: node.getAttribute("preserveAspectRatio") ?? void 0,
      role: node.getAttribute("role") ?? void 0,
      "aria-label": node.getAttribute("aria-label") ?? void 0,
      ...rest,
      children: [
        title ? /* @__PURE__ */ jsx41("title", { children: title.textContent }) : null,
        area ? /* @__PURE__ */ jsx41(
          "polygon",
          {
            className: "sparkline__area",
            points: area.getAttribute("points") ?? void 0,
            fill: area.getAttribute("fill") ?? void 0,
            fillOpacity: area.getAttribute("fill-opacity") ?? void 0
          }
        ) : null,
        line ? /* @__PURE__ */ jsx41(
          "polyline",
          {
            className: "sparkline__line",
            points: line.getAttribute("points") ?? void 0,
            fill: line.getAttribute("fill") ?? void 0,
            stroke: line.getAttribute("stroke") ?? void 0,
            strokeWidth: line.getAttribute("stroke-width") ?? void 0,
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ) : null
      ]
    }
  );
}

// ../design-system/js/stability-cell.js
var DEFAULT_FLIPS_LABEL = {
  en: "Flaky flips",
  ru: "\u0424\u043B\u0438\u043F\u044B flaky"
};
var STATUS_LABELS = {
  en: {
    passed: "PASSED",
    failed: "FAILED",
    broken: "BROKEN",
    skipped: "SKIPPED",
    unknown: "UNKNOWN"
  },
  ru: {
    passed: "\u041F\u0420\u041E\u0419\u0414\u0415\u041D",
    failed: "\u0423\u041F\u0410\u041B",
    broken: "\u0421\u041B\u041E\u041C\u0410\u041D",
    skipped: "\u041F\u0420\u041E\u041F\u0423\u0429\u0415\u041D",
    unknown: "\u041D\u0415\u0418\u0417\u0412\u0415\u0421\u0422\u0415\u041D"
  }
};
function stabilityStatusLabel(status, lang = "ru") {
  const normalized = (status || "unknown").toLowerCase();
  const table = STATUS_LABELS[lang] ?? STATUS_LABELS.en;
  return table[normalized] ?? table.unknown;
}
function buildStabilityCell(flakyFlips, history, theme, options = {}) {
  const lang = options.lang ?? "ru";
  const flipsLabel = options.flipsLabel ?? DEFAULT_FLIPS_LABEL[lang] ?? DEFAULT_FLIPS_LABEL.en;
  const limit = options.limit ?? 10;
  const runs = (history ?? []).slice(-limit);
  const flips = flakyFlips ?? 0;
  const root = document.createElement("div");
  root.className = "stability-cell";
  const dotsWrap = document.createElement("span");
  dotsWrap.className = "stability-dots";
  dotsWrap.setAttribute("aria-hidden", "true");
  if (runs.length) {
    for (const point of runs) {
      const status = (point.status || "unknown").toLowerCase();
      const dot = document.createElement("span");
      dot.className = `stability-dot stability-dot--${status}`;
      dot.style.background = statusSparkColor(point.status, theme);
      dot.title = stabilityStatusLabel(status, lang);
      dotsWrap.append(dot);
    }
  } else {
    dotsWrap.textContent = "\u2014";
  }
  root.append(dotsWrap);
  if (flips > 0) {
    const badge = document.createElement("span");
    badge.className = "badge badge--flaky";
    badge.title = `${flipsLabel}: ${flips}`;
    badge.textContent = String(flips);
    root.append(badge);
  }
  return root;
}

// src/StabilityCell.tsx
import { jsx as jsx42, jsxs as jsxs19 } from "react/jsx-runtime";
function siteSparklineTheme2() {
  const site = typeof document !== "undefined" && document.documentElement.classList.contains("theme-light") ? "light" : "dark";
  return sparklineThemeFromSite(site);
}
function dotsFromCanon(dotsWrap) {
  if (!dotsWrap) {
    return "\u2014";
  }
  const dots = [...dotsWrap.querySelectorAll(":scope > .stability-dot")];
  if (dots.length === 0) {
    return dotsWrap.textContent;
  }
  return dots.map((dot, index) => /* @__PURE__ */ jsx42(
    "span",
    {
      className: dot.getAttribute("class") ?? void 0,
      title: dot.getAttribute("title") ?? void 0,
      style: { background: dot.style.background }
    },
    `${dot.className}-${index}`
  ));
}
function StabilityCell({
  history,
  flakyFlips = 0,
  theme,
  lang = "ru",
  limit = 10,
  className,
  ...rest
}) {
  const node = buildStabilityCell(
    flakyFlips,
    [...history],
    theme ?? siteSparklineTheme2(),
    { lang, limit }
  );
  const rootClass = cn(node.getAttribute("class") ?? void 0, className);
  const dotsWrap = node.querySelector(":scope > .stability-dots");
  const badge = node.querySelector(":scope > .badge.badge--flaky");
  return /* @__PURE__ */ jsxs19("div", { className: rootClass, ...rest, children: [
    /* @__PURE__ */ jsx42(
      "span",
      {
        className: dotsWrap?.getAttribute("class") ?? "stability-dots",
        "aria-hidden": true,
        children: dotsFromCanon(dotsWrap)
      }
    ),
    badge ? /* @__PURE__ */ jsx42(
      "span",
      {
        className: badge.getAttribute("class") ?? "badge badge--flaky",
        title: badge.getAttribute("title") ?? void 0,
        children: badge.textContent
      }
    ) : null
  ] });
}

// src/TestsTable.tsx
import { jsx as jsx43, jsxs as jsxs20 } from "react/jsx-runtime";
function normalizeStatus(status) {
  return (status || "unknown").toLowerCase();
}
function formatDurationSec(durationSec) {
  return `${durationSec.toFixed(2)}s`;
}
function TestsTable({
  rows,
  lang = "ru",
  className,
  ...rest
}) {
  return /* @__PURE__ */ jsx43("div", { className: cn("tests-table-wrap", className), ...rest, children: /* @__PURE__ */ jsxs20("table", { className: "tests-table", children: [
    /* @__PURE__ */ jsx43("thead", { children: /* @__PURE__ */ jsxs20("tr", { children: [
      /* @__PURE__ */ jsx43("th", { children: "Test" }),
      /* @__PURE__ */ jsx43("th", { children: "Status" }),
      /* @__PURE__ */ jsx43("th", { children: "Stability" }),
      /* @__PURE__ */ jsx43("th", { children: "Duration" })
    ] }) }),
    /* @__PURE__ */ jsx43("tbody", { children: rows.map((row) => {
      const status = normalizeStatus(row.status);
      return /* @__PURE__ */ jsxs20("tr", { children: [
        /* @__PURE__ */ jsx43("td", { className: "tests-table__name", title: row.name, children: row.name }),
        /* @__PURE__ */ jsx43("td", { className: "tests-table__status", children: /* @__PURE__ */ jsx43("span", { className: `badge badge--status-${status}`, children: stabilityStatusLabel(status, lang) }) }),
        /* @__PURE__ */ jsx43("td", { className: "tests-table__stability", children: /* @__PURE__ */ jsx43(
          StabilityCell,
          {
            history: row.history,
            flakyFlips: row.flakyFlips,
            lang
          }
        ) }),
        /* @__PURE__ */ jsx43("td", { className: "tests-table__duration", children: /* @__PURE__ */ jsxs20("div", { className: "duration-bar", children: [
          /* @__PURE__ */ jsx43("span", { className: "duration-bar__value", children: formatDurationSec(row.durationSec) }),
          /* @__PURE__ */ jsx43("span", { className: "duration-bar__track", children: /* @__PURE__ */ jsx43(
            "span",
            {
              className: `duration-bar__fill duration-bar__fill--${status}`,
              style: { width: `${row.durationFill}%` }
            }
          ) })
        ] }) })
      ] }, row.name);
    }) })
  ] }) });
}

// src/QgInfo.tsx
import { useLayoutEffect as useLayoutEffect2, useRef as useRef3 } from "react";

// ../design-system/js/code-highlight.js
var JSON_TOKEN2 = /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;
function escapeHtmlKeepQuotes2(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function highlightJson2(json, options) {
  const opts = options || {};
  const prefix = opts.prefix || "ch-tok";
  const dangerLiterals = opts.dangerLiterals ? opts.dangerLiterals instanceof Set ? opts.dangerLiterals : new Set(opts.dangerLiterals) : void 0;
  let html = escapeHtmlKeepQuotes2(json);
  html = html.replace(JSON_TOKEN2, function(match) {
    let cls = prefix + "-str";
    if (/^"/.test(match)) {
      if (/:\s*$/.test(match)) {
        const key = match.replace(/:\s*$/, "");
        return '<span class="' + prefix + '-key">' + key + '</span><span class="' + prefix + '-punct">:</span>';
      }
      cls = prefix + "-str";
    } else if (match === "true" || match === "false") {
      cls = prefix + "-bool";
    } else if (match === "null") {
      cls = prefix + "-null";
    } else {
      cls = dangerLiterals?.has(match) ? prefix + "-danger" : prefix + "-num";
    }
    return '<span class="' + cls + '">' + match + "</span>";
  });
  html = html.replace(/([{}\[\],])/g, function(ch) {
    return '<span class="' + prefix + '-punct">' + ch + "</span>";
  });
  return html;
}
function wrapToken2(prefix, cls, text) {
  return '<span class="' + prefix + "-" + cls + '">' + escapeHtml2(text) + "</span>";
}
function highlightShellValue2(value, prefix) {
  if (value === "true" || value === "false") {
    return wrapToken2(prefix, "bool", value);
  }
  if (/^-?\d+(?:\.\d+)?$/.test(value)) {
    return wrapToken2(prefix, "num", value);
  }
  return wrapToken2(prefix, "str", value);
}
function highlightShellToken2(token, prefix) {
  if (/^\s*#/.test(token)) {
    return wrapToken2(prefix, "comment", token);
  }
  if (/^'/.test(token)) {
    return wrapToken2(prefix, "str", token);
  }
  if (/^\\/.test(token)) {
    return wrapToken2(prefix, "punct", token);
  }
  if (/^-D/.test(token)) {
    const eq = token.indexOf("=");
    if (eq < 0) {
      return wrapToken2(prefix, "key", token);
    }
    return wrapToken2(prefix, "key", token.slice(0, eq)) + wrapToken2(prefix, "punct", "=") + highlightShellValue2(token.slice(eq + 1), prefix);
  }
  if (token === "curl") {
    return wrapToken2(prefix, "cmd", token);
  }
  if (/^--/.test(token) || /^-[a-zA-Z]+$/.test(token) || /^(POST|GET|PUT|DELETE|PATCH|HEAD)$/.test(token) || token === "export" || token === "test" || token === "./gradlew" || token === "gradle" || token === "allurectl" || /^ALLURE_/.test(token) || token === "TEST_CASE_ID") {
    return wrapToken2(prefix, "key", token);
  }
  return escapeHtml2(token);
}
var SHELL_TOKEN2 = /'[^']*'|-D[\w.]+(?:=[^\s\\']*)?|--[\w-]+|\bcurl\b|\.\/gradlew|allurectl|\bgradle\b|\bexport\b|\btest\b|\b(?:POST|GET|PUT|DELETE|PATCH|HEAD)\b|\b(?:ALLURE_[A-Z_]+|TEST_CASE_ID)\b|-[a-zA-Z]+\b|\\\s*$|\s+#.*$/g;
function highlightShellLine2(line, prefix) {
  if (/^\s*#/.test(line)) {
    return wrapToken2(prefix, "comment", line);
  }
  let html = "";
  let last = 0;
  let match;
  SHELL_TOKEN2.lastIndex = 0;
  while ((match = SHELL_TOKEN2.exec(line)) !== null) {
    html += escapeHtml2(line.slice(last, match.index));
    html += highlightShellToken2(match[0], prefix);
    last = match.index + match[0].length;
  }
  html += escapeHtml2(line.slice(last));
  return html;
}
function highlightShell2(text, options) {
  const opts = options || {};
  const prefix = opts.prefix || "ch-tok";
  return String(text).split("\n").map(function(line) {
    return highlightShellLine2(line, prefix);
  }).join("\n");
}
function tryHighlightCurlQuotedData2(text, options) {
  const opts = options || {};
  const prefix = opts.prefix || "ch-tok";
  const lines = String(text).split("\n");
  const openIdx = lines.findIndex(function(line) {
    return /(?:^|\s)-d\s+'/.test(line);
  });
  if (openIdx < 0) return null;
  const openLine = lines[openIdx];
  const m = openLine.match(/^(.*-d\s+')(.*)$/);
  if (!m) return null;
  const openWithoutQuote = m[1].slice(0, -1);
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
  const openHl = highlightShellLine2(openWithoutQuote, prefix) + wrapToken2(prefix, "punct", "'");
  const body = highlightJson2(jsonText, options);
  const closeQuote = wrapToken2(prefix, "punct", "'");
  const head = lines.slice(0, openIdx).map(function(line) {
    return highlightShellLine2(line, prefix);
  });
  const bodyLines = body.split("\n");
  if (closeIdx === openIdx || bodyLines.length === 1) {
    return head.concat([openHl + body + closeQuote]).join("\n");
  }
  const first = openHl + bodyLines[0];
  const mid = bodyLines.slice(1, -1);
  const last = bodyLines[bodyLines.length - 1] + closeQuote;
  return head.concat([first], mid, [last]).join("\n");
}
function highlightCurlHeredoc2(text, options) {
  return tryHighlightCurlQuotedData2(text, options) || highlightShell2(text, options);
}
function highlightMarkdownInline2(text, prefix) {
  let html = "";
  let last = 0;
  const re = /`([^`]+)`|\*\*([^*]+)\*\*/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    html += escapeHtml2(text.slice(last, match.index));
    if (match[1] != null) {
      html += wrapToken2(prefix, "punct", "`");
      html += wrapToken2(prefix, "str", match[1]);
      html += wrapToken2(prefix, "punct", "`");
    } else {
      html += wrapToken2(prefix, "punct", "**");
      html += wrapToken2(prefix, "key", match[2]);
      html += wrapToken2(prefix, "punct", "**");
    }
    last = match.index + match[0].length;
  }
  html += escapeHtml2(text.slice(last));
  return html;
}
function highlightMarkdownLine2(line, prefix) {
  if (/^#{1,6}\s/.test(line)) {
    const m = line.match(/^(#{1,6})(\s+)(.*)$/);
    if (!m) return escapeHtml2(line);
    return wrapToken2(prefix, "cmd", m[1]) + escapeHtml2(m[2]) + highlightMarkdownInline2(m[3], prefix);
  }
  if (/^-\s/.test(line)) {
    return wrapToken2(prefix, "punct", "-") + highlightMarkdownInline2(line.slice(1), prefix);
  }
  return highlightMarkdownInline2(line, prefix);
}
function highlightMarkdown2(text, options) {
  const opts = options || {};
  const prefix = opts.prefix || "ch-tok";
  const lines = String(text).split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const fenceOpen = line.match(/^```(\w*)\s*$/);
    if (fenceOpen) {
      out.push(wrapToken2(prefix, "punct", line));
      i += 1;
      const body = [];
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      const lang = fenceOpen[1] || "";
      if (lang === "json" || body.length > 0 && /^\s*[{[]/.test(body[0])) {
        out.push(highlightJson2(body.join("\n"), options));
      } else {
        for (let b = 0; b < body.length; b++) {
          out.push(escapeHtml2(body[b]));
        }
      }
      if (i < lines.length && /^```\s*$/.test(lines[i])) {
        out.push(wrapToken2(prefix, "punct", lines[i]));
        i += 1;
      }
      continue;
    }
    out.push(highlightMarkdownLine2(line, prefix));
    i += 1;
  }
  return out.join("\n");
}
function trimOutputBlankLines2(text) {
  return String(text).replace(/^\n+/, "").replace(/\n+$/, "");
}
function highlightOutput2(text, kind) {
  const trimmed = trimOutputBlankLines2(text);
  switch (kind) {
    case "json":
      return highlightJson2(trimmed);
    case "shell":
      return highlightShell2(trimmed);
    case "curl":
      return highlightCurlHeredoc2(trimmed);
    case "markdown":
      return highlightMarkdown2(trimmed);
    case "plain":
    default:
      return escapeHtml2(trimmed);
  }
}
function mountHighlightedOutput2(el, text, kind) {
  if (!el) return;
  el.classList.add("ch-code");
  el.innerHTML = highlightOutput2(text, kind || "json");
}
if (typeof globalThis !== "undefined") {
  globalThis.CodeHighlight = {
    escapeHtml: escapeHtml2,
    highlightJson: highlightJson2,
    highlightShell: highlightShell2,
    highlightCurlHeredoc: highlightCurlHeredoc2,
    highlightMarkdown: highlightMarkdown2,
    trimOutputBlankLines: trimOutputBlankLines2,
    highlightOutput: highlightOutput2,
    mountHighlightedOutput: mountHighlightedOutput2
  };
}

// ../design-system/js/quality-gate-source.mjs
var ALLURE_QUALITY_GATE_SOURCE = {
  configFile: "allurerc.mjs",
  rulesFile: "allure/quality-gate.mjs",
  knownIssuesFile: "./known.json",
  hrefBase: "https://github.com/autotests-ai/autotests-ai-multistack-app/blob/master/tests/java/tests-java-junit5-rest_assured-selenide/"
};

// ../design-system/js/qg-info.js
var INFO_ICON = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="6.25"/><path d="M8 7.25v3.5"/><circle cx="8" cy="5.15" r="0.65" fill="currentColor" stroke="none"/></svg>`;
var VIEWPORT_MARGIN = 32;
var POPOVER_GAP = 6;
var POPOVER_MAX_WIDTH = 448;
var POPOVER_MIN_HEIGHT = 80;
var QG_INFO_SAMPLE_SOURCE = { ...ALLURE_QUALITY_GATE_SOURCE };
function resolveQgInfoPathHref(value, hrefBase) {
  if (!value) {
    return null;
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  if (!hrefBase) {
    return null;
  }
  const base = hrefBase.endsWith("/") ? hrefBase : `${hrefBase}/`;
  return base + value.replace(/^\.\//, "");
}
function createQgInfoPathValue(value, hrefBase, options = {}) {
  const linkable = options.linkable !== false;
  const href = options.href ?? (linkable ? resolveQgInfoPathHref(value, hrefBase) : resolveQgInfoPathHref(value, void 0));
  if (href) {
    const link = document.createElement("a");
    link.className = "link qg-info__path-link";
    link.href = href;
    link.title = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = value;
    return link;
  }
  const span = document.createElement("span");
  span.className = "qg-info__path-value";
  span.textContent = value;
  return span;
}
function createQgInfoPaths(fileSource) {
  if (!fileSource) {
    return null;
  }
  const rows = [];
  if (fileSource.configFile) {
    rows.push({ label: "config", value: fileSource.configFile });
  }
  if (fileSource.rulesFile) {
    rows.push({ label: "rules", value: fileSource.rulesFile });
  }
  if (fileSource.knownIssuesFile) {
    rows.push({ label: "known", value: fileSource.knownIssuesFile });
  }
  if (fileSource.profile) {
    rows.push({
      label: "profile",
      value: fileSource.profile,
      href: fileSource.profileHref,
      linkable: !fileSource.profileHref
    });
  }
  if (fileSource.projectKey) {
    rows.push({
      label: "project",
      value: fileSource.projectKey,
      href: fileSource.projectHref,
      linkable: !fileSource.projectHref
    });
  }
  if (!rows.length) {
    return null;
  }
  const list = document.createElement("ul");
  list.className = "qg-info__paths";
  for (const row of rows) {
    const item = document.createElement("li");
    item.className = "qg-info__path";
    const label = document.createElement("span");
    label.className = "qg-info__path-label";
    label.textContent = row.label;
    const value = createQgInfoPathValue(row.value, fileSource.hrefBase, {
      linkable: row.linkable,
      href: row.href
    });
    item.append(label, value);
    list.append(item);
  }
  return list;
}
function placeQgInfoPopover(trigger, popover) {
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const width = Math.min(POPOVER_MAX_WIDTH, viewportWidth - VIEWPORT_MARGIN * 2);
  const triggerRect = trigger.getBoundingClientRect();
  const spaceBelow = viewportHeight - VIEWPORT_MARGIN - triggerRect.bottom - POPOVER_GAP;
  const spaceAbove = triggerRect.top - VIEWPORT_MARGIN - POPOVER_GAP;
  const placeBelow = spaceBelow >= spaceAbove;
  const maxHeight = Math.max(POPOVER_MIN_HEIGHT, placeBelow ? spaceBelow : spaceAbove);
  popover.style.width = `${width}px`;
  popover.style.maxHeight = `${Math.round(maxHeight)}px`;
  popover.style.left = "0px";
  popover.style.top = "0px";
  const popoverHeight = popover.getBoundingClientRect().height;
  let left = triggerRect.right - width;
  left = Math.max(VIEWPORT_MARGIN, Math.min(left, viewportWidth - width - VIEWPORT_MARGIN));
  let top;
  if (placeBelow) {
    top = triggerRect.bottom + POPOVER_GAP;
  } else {
    top = triggerRect.top - POPOVER_GAP - popoverHeight;
    top = Math.max(VIEWPORT_MARGIN, top);
  }
  popover.style.left = `${Math.round(left)}px`;
  popover.style.top = `${Math.round(top)}px`;
}
function wireQgInfoPopover(root) {
  const trigger = root.querySelector(".qg-info__trigger");
  const popover = root.querySelector(".qg-info__popover");
  if (!(trigger instanceof HTMLElement) || !(popover instanceof HTMLElement)) {
    return;
  }
  let pinned = false;
  let hoverCloseTimer;
  const show = () => {
    popover.style.visibility = "hidden";
    popover.style.opacity = "0";
    popover.style.pointerEvents = "none";
    popover.style.display = "block";
    placeQgInfoPopover(trigger, popover);
    popover.style.removeProperty("visibility");
    popover.style.removeProperty("opacity");
    popover.style.removeProperty("pointer-events");
    root.classList.add("qg-info--open");
  };
  const hide = () => {
    root.classList.remove("qg-info--open");
  };
  const cancelHoverClose = () => {
    if (hoverCloseTimer !== void 0) {
      clearTimeout(hoverCloseTimer);
      hoverCloseTimer = void 0;
    }
  };
  const scheduleHoverClose = () => {
    if (pinned) {
      return;
    }
    cancelHoverClose();
    hoverCloseTimer = setTimeout(() => {
      hoverCloseTimer = void 0;
      hide();
    }, 60);
  };
  const setPinned = (next) => {
    pinned = next;
    root.classList.toggle("qg-info--pinned", pinned);
    trigger.setAttribute("aria-expanded", pinned ? "true" : "false");
    if (pinned) {
      cancelHoverClose();
      show();
      return;
    }
    hide();
    trigger.blur();
  };
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    setPinned(!pinned);
  });
  root.addEventListener("mouseenter", () => {
    cancelHoverClose();
    if (!pinned) {
      show();
    }
  });
  root.addEventListener("mouseleave", scheduleHoverClose);
  popover.addEventListener("mouseenter", cancelHoverClose);
  popover.addEventListener("mouseleave", scheduleHoverClose);
  root.addEventListener("focusin", () => {
    if (!pinned) {
      show();
    }
  });
  root.addEventListener("focusout", (event) => {
    if (pinned) {
      return;
    }
    if (event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) {
      return;
    }
    hide();
  });
  const reposition = () => {
    if (root.classList.contains("qg-info--open") || pinned) {
      placeQgInfoPopover(trigger, popover);
    }
  };
  window.addEventListener("resize", reposition);
  window.addEventListener("scroll", reposition, true);
}
function formatQgInfoDeviationLiteral(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return String(value);
}
function collectQgInfoDeviationLiterals(payload) {
  const literals = /* @__PURE__ */ new Set();
  if (!payload || typeof payload !== "object") {
    return literals;
  }
  const result = (
    /** @type {Record<string, unknown>} */
    payload.result
  );
  if (!result || typeof result !== "object") {
    return literals;
  }
  const res = (
    /** @type {Record<string, unknown>} */
    result
  );
  if (Array.isArray(res.rules)) {
    for (const rule of res.rules) {
      if (!rule || typeof rule !== "object") {
        continue;
      }
      const entry = (
        /** @type {Record<string, unknown>} */
        rule
      );
      if (entry.passed === false && entry.actual !== void 0 && entry.actual !== null) {
        literals.add(formatQgInfoDeviationLiteral(entry.actual));
      }
    }
  }
  if (Array.isArray(res.conditions)) {
    for (const condition of res.conditions) {
      if (!condition || typeof condition !== "object") {
        continue;
      }
      const entry = (
        /** @type {Record<string, unknown>} */
        condition
      );
      const status = String(entry.status ?? "").toUpperCase();
      if (status && status !== "OK" && status !== "PASSED") {
        if (entry.actualValue !== void 0 && entry.actualValue !== null) {
          literals.add(formatQgInfoDeviationLiteral(entry.actualValue));
        }
      }
    }
  }
  return literals;
}
function createQgInfo(content, fileSource) {
  const payload = typeof content === "string" ? null : content;
  const code = typeof content === "string" ? content : JSON.stringify(content, null, 2);
  const dangerLiterals = payload ? collectQgInfoDeviationLiterals(payload) : void 0;
  const popoverId = `qg-info-${Math.random().toString(36).slice(2, 9)}`;
  const root = document.createElement("div");
  root.className = "qg-info";
  root.dataset.testid = "qg-info";
  root.innerHTML = `
    <button type="button" class="icon-btn qg-info__trigger" aria-label="Quality gate config" aria-haspopup="dialog" aria-expanded="false" aria-controls="${popoverId}">
      <span class="icon">${INFO_ICON}</span>
    </button>
    <div class="qg-info__popover" id="${popoverId}" role="dialog" aria-label="Quality gate config"></div>
  `;
  const popover = root.querySelector(".qg-info__popover");
  const paths = createQgInfoPaths(fileSource);
  if (popover && paths) {
    popover.append(paths);
  }
  if (popover) {
    popover.classList.add("ch-theme--vscode");
    const pre = document.createElement("pre");
    pre.className = "qg-info__code ch-code";
    pre.setAttribute("aria-label", "Quality gate JSON");
    pre.innerHTML = highlightJson2(code, { dangerLiterals });
    popover.append(pre);
  }
  wireQgInfoPopover(root);
  return root;
}

// src/QgInfo.tsx
import { jsx as jsx44 } from "react/jsx-runtime";
function QgInfo({
  content,
  fileSource,
  className,
  "data-testid": dataTestId = "qg-info",
  ...rest
}) {
  const hostRef = useRef3(null);
  useLayoutEffect2(() => {
    const host = hostRef.current;
    const parent = host?.parentNode;
    if (!host || !parent) {
      return void 0;
    }
    const node = createQgInfo(content, fileSource);
    node.dataset.testid = dataTestId;
    if (className) {
      node.className = cn(node.className, className);
    }
    parent.insertBefore(node, host);
    return () => {
      node.remove();
    };
  }, [content, fileSource, className, dataTestId]);
  return /* @__PURE__ */ jsx44("div", { ref: hostRef, ...rest, hidden: true });
}

// src/QualityGate.tsx
import { useMemo } from "react";

// ../design-system/js/quality-gate.js
var DEFAULT_LABELS = {
  passed: { en: "Quality gate passed", ru: "Quality gate \u043F\u0440\u043E\u0439\u0434\u0435\u043D" },
  failed: { en: "Quality gate failed", ru: "Quality gate \u043D\u0435 \u043F\u0440\u043E\u0439\u0434\u0435\u043D" }
};
function resolveQualityGateLabel(entry, key, lang = "ru") {
  if (!entry) {
    return DEFAULT_LABELS[key][lang] ?? DEFAULT_LABELS[key].en;
  }
  if (typeof entry === "string") {
    return entry;
  }
  return entry[lang] ?? entry.en ?? entry.ru ?? DEFAULT_LABELS[key].en;
}
function resolveQualityGateRuleExpected(rule) {
  if (rule.expected !== void 0 && rule.expected !== null) {
    return rule.expected;
  }
  if (rule.threshold !== void 0 && rule.threshold !== null) {
    return rule.threshold;
  }
  return void 0;
}
function formatQualityGateRuleFormula(rule) {
  const { id, actual, comparator } = rule;
  const expected = resolveQualityGateRuleExpected(rule);
  if (actual === void 0 || expected === void 0) {
    return "";
  }
  if (comparator) {
    const op = comparator === "LT" ? "<" : comparator === "LTE" ? "\u2264" : comparator === "GT" ? ">" : comparator === "GTE" ? "\u2265" : comparator === "EQ" ? "=" : "\u2260";
    return `FAIL: ${actual} ${op} ${expected}`;
  }
  switch (id) {
    case "maxFailures":
      return `FAIL: ${actual} > ${expected}`;
    case "minTestsCount":
      return `FAIL: ${actual} < ${expected}`;
    case "successRate":
      return `FAIL: ${actual}% < ${expected}%`;
    case "maxDuration":
      return `FAIL: ${actual}s > ${expected}s`;
    default:
      return `FAIL: ${actual} vs ${expected}`;
  }
}
function resolveQualityGateFileSource(config) {
  if (!config) {
    return void 0;
  }
  const fileSource = config.source ?? {};
  const resolved = {};
  if (fileSource.configFile) {
    resolved.configFile = fileSource.configFile;
  }
  if (fileSource.rulesFile) {
    resolved.rulesFile = fileSource.rulesFile;
  }
  const knownIssuesFile = fileSource.knownIssuesFile ?? config.knownIssuesPath;
  if (knownIssuesFile) {
    resolved.knownIssuesFile = knownIssuesFile;
  }
  const profile = fileSource.profile ?? config.profile;
  if (profile) {
    resolved.profile = profile;
  }
  const projectKey = fileSource.projectKey ?? config.projectKey;
  if (projectKey) {
    resolved.projectKey = projectKey;
  }
  if (fileSource.hrefBase) {
    resolved.hrefBase = fileSource.hrefBase;
  }
  if (fileSource.profileHref) {
    resolved.profileHref = fileSource.profileHref;
  }
  if (fileSource.projectHref) {
    resolved.projectHref = fileSource.projectHref;
  }
  return Object.keys(resolved).length ? resolved : void 0;
}
function buildQualityGateInfoPayload(options) {
  const rules = options.rules ?? [];
  const config = options.config ?? { rules: [] };
  return {
    qualityGate: {
      rules: config.rules ?? []
    },
    result: {
      passed: Boolean(options.passed),
      rules
    }
  };
}

// src/QualityGate.tsx
import { jsx as jsx45, jsxs as jsxs21 } from "react/jsx-runtime";
function QualityGateFailedRules({ rules }) {
  const failedRules = rules.filter((rule) => !rule.passed);
  if (!failedRules.length) {
    return null;
  }
  return /* @__PURE__ */ jsx45("ul", { className: "quality-gate__rules", children: failedRules.map((rule) => {
    const formula = formatQualityGateRuleFormula(rule);
    return /* @__PURE__ */ jsxs21("li", { className: "quality-gate__rule", children: [
      /* @__PURE__ */ jsx45("div", { className: "quality-gate__rule-id", children: rule.id }),
      /* @__PURE__ */ jsxs21("div", { className: "quality-gate__rule-detail", children: [
        /* @__PURE__ */ jsx45("p", { className: "quality-gate__message", children: rule.message }),
        formula ? /* @__PURE__ */ jsx45("p", { className: "quality-gate__formula", children: formula }) : null
      ] })
    ] }, rule.id);
  }) });
}
function QualityGate({
  rules,
  passed = false,
  lang = "ru",
  barTitle = "Quality gate",
  config,
  labels,
  kind = "allure",
  infoPayload: infoPayloadProp,
  className,
  "aria-label": ariaLabel,
  "data-testid": dataTestId,
  ...rest
}) {
  const testId = dataTestId ?? (kind === "sonar" ? "sonar-quality-gate" : "quality-gate");
  const infoPayload = useMemo(
    () => infoPayloadProp ?? buildQualityGateInfoPayload({
      passed,
      rules: [...rules],
      config
    }),
    [infoPayloadProp, passed, rules, config]
  );
  const fileSource = useMemo(
    () => resolveQualityGateFileSource(config),
    [config]
  );
  if (!rules.length) {
    return /* @__PURE__ */ jsx45(
      "div",
      {
        className: cn("quality-gate", className),
        ...rest,
        hidden: true,
        "data-testid": testId
      }
    );
  }
  const statusLabel = passed ? resolveQualityGateLabel(labels?.passed, "passed", lang) : resolveQualityGateLabel(labels?.failed, "failed", lang);
  const tone = passed ? "passed" : "failed";
  return /* @__PURE__ */ jsxs21(
    "div",
    {
      className: cn(
        "quality-gate",
        `quality-gate--${kind}`,
        `quality-gate--${tone}`,
        className
      ),
      ...rest,
      role: "status",
      "data-testid": testId,
      "aria-label": ariaLabel ?? statusLabel,
      children: [
        /* @__PURE__ */ jsxs21("div", { className: "quality-gate__bar", children: [
          /* @__PURE__ */ jsx45(Indicator, { tone, solid: true, "aria-hidden": "true" }),
          /* @__PURE__ */ jsx45("span", { className: "quality-gate__bar-title", children: barTitle }),
          /* @__PURE__ */ jsx45(QgInfo, { content: infoPayload, fileSource })
        ] }),
        /* @__PURE__ */ jsx45("div", { className: "quality-gate__body", children: passed ? /* @__PURE__ */ jsx45("p", { className: "quality-gate__verdict quality-gate__verdict--ok", children: lang === "en" ? "Passed" : "\u041F\u0440\u043E\u0439\u0434\u0435\u043D" }) : /* @__PURE__ */ jsx45(QualityGateFailedRules, { rules }) })
      ]
    }
  );
}

// src/SonarQualityGate.tsx
import { useMemo as useMemo2 } from "react";

// ../design-system/js/sonar-quality-gate.js
var DEFAULT_BAR_TITLE = "Sonar Quality Gate";
var DEFAULT_SONAR_HOST = "https://sonar.qa.guru";
var DEFAULT_SONAR_HREF_BASE = "https://github.com/qa-guru/zero-design-system/blob/master/";
var DEFAULT_LABELS2 = {
  passed: { en: "Sonar Quality Gate passed", ru: "Sonar Quality Gate \u043F\u0440\u043E\u0439\u0434\u0435\u043D" },
  failed: { en: "Sonar Quality Gate failed", ru: "Sonar Quality Gate \u043D\u0435 \u043F\u0440\u043E\u0439\u0434\u0435\u043D" }
};
var RATING_LETTERS = { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E" };
function coerceSonarNumber(value) {
  if (value === void 0 || value === null || value === "") {
    return void 0;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const trimmed = String(value).trim();
  if (!trimmed || !/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return value;
  }
  const num = Number(trimmed);
  if (!Number.isFinite(num)) {
    return value;
  }
  return Number.isInteger(num) ? num : Math.round(num * 10) / 10;
}
function normalizeSonarCondition(condition) {
  const next = { ...condition };
  if (condition.errorThreshold !== void 0) {
    const coerced = coerceSonarNumber(condition.errorThreshold);
    if (coerced !== void 0) {
      next.errorThreshold = coerced;
    }
  }
  if (condition.warningThreshold !== void 0) {
    const coerced = coerceSonarNumber(condition.warningThreshold);
    if (coerced !== void 0) {
      next.warningThreshold = coerced;
    }
  }
  if (condition.actualValue !== void 0) {
    const coerced = coerceSonarNumber(condition.actualValue);
    if (coerced !== void 0) {
      next.actualValue = coerced;
    }
  }
  return next;
}
function formatSonarMetricValue(value, metricKey) {
  if (value === void 0 || value === null || value === "") {
    return void 0;
  }
  if (/rating/i.test(metricKey)) {
    const num = Number(value);
    if (Number.isFinite(num) && RATING_LETTERS[num]) {
      return RATING_LETTERS[num];
    }
  }
  return coerceSonarNumber(value);
}
function mapSonarConditionToRule(condition) {
  const id = condition.metricKey ?? "condition";
  const comparator = (
    /** @type {import("./quality-gate.js").QualityGateRule["comparator"]} */
    condition.comparator ?? "GT"
  );
  const thresholdRaw = condition.errorThreshold ?? condition.warningThreshold;
  const actual = formatSonarMetricValue(condition.actualValue, id);
  const threshold = formatSonarMetricValue(thresholdRaw, id);
  const status = (condition.status ?? "").toUpperCase();
  const passed = status === "OK" || status === "PASSED";
  let message;
  if (passed) {
    message = `${id} ${actual ?? "\u2014"} within threshold ${threshold ?? "\u2014"}`;
  } else if (comparator === "LT" || comparator === "LTE") {
    message = `${id} ${actual ?? "\u2014"} is below the required ${threshold ?? "\u2014"}`;
  } else if (comparator === "GT" || comparator === "GTE") {
    message = `${id} ${actual ?? "\u2014"} exceeds the allowed ${threshold ?? "\u2014"}`;
  } else {
    message = `${id} ${actual ?? "\u2014"} vs ${threshold ?? "\u2014"}`;
  }
  return {
    id,
    message,
    passed,
    actual,
    threshold,
    comparator
  };
}
function buildSonarProfileHref(profile, sonarHost = DEFAULT_SONAR_HOST) {
  if (!profile) {
    return void 0;
  }
  return `${sonarHost.replace(/\/$/, "")}/profiles/show?name=${encodeURIComponent(profile)}`;
}
function buildSonarProjectHref(projectKey, dashboardUrl, sonarHost = DEFAULT_SONAR_HOST) {
  if (dashboardUrl) {
    return dashboardUrl;
  }
  if (!projectKey) {
    return void 0;
  }
  return `${sonarHost.replace(/\/$/, "")}/dashboard?id=${encodeURIComponent(projectKey)}`;
}
function resolveSonarQgInfoSource(source = {}, projectStatus = {}, profile, projectKey) {
  const sonarHost = source.sonarHost ?? DEFAULT_SONAR_HOST;
  const key = projectKey ?? projectStatus.project_key ?? projectStatus.projectKey ?? source.projectKey;
  const profileName = profile ?? source.profile;
  return {
    configFile: source.configFile ?? "docs/sonar/quality-gate-profile.json",
    profile: profileName,
    projectKey: key,
    hrefBase: source.hrefBase ?? DEFAULT_SONAR_HREF_BASE,
    profileHref: source.profileHref ?? buildSonarProfileHref(profileName, sonarHost),
    projectHref: source.projectHref ?? buildSonarProjectHref(key, projectStatus.dashboard_url, sonarHost)
  };
}
function buildSonarQualityGateInfoPayload(projectStatus, meta = {}) {
  const conditions = (projectStatus.conditions ?? []).map(normalizeSonarCondition);
  const projectKey = projectStatus.project_key ?? projectStatus.projectKey ?? meta.source?.projectKey;
  const status = projectStatus.status ?? (projectStatus.ok || projectStatus.passed ? "OK" : "ERROR");
  const passed = projectStatus.passed ?? projectStatus.ok ?? ["OK", "PASSED"].includes(String(status).toUpperCase());
  const profileConditions = (meta.profileConditions ?? []).map((condition) => {
    if (!condition || typeof condition !== "object") {
      return condition;
    }
    const next = { ...condition };
    if ("error" in next) {
      const coerced = coerceSonarNumber(
        /** @type {string | number | undefined} */
        next.error
      );
      if (coerced !== void 0) {
        next.error = coerced;
      }
    }
    return next;
  });
  return {
    qualityGate: {
      profile: meta.profile ?? meta.source?.profile,
      projectKey,
      conditions: profileConditions
    },
    result: {
      status,
      passed: Boolean(passed),
      analysisId: projectStatus.analysis_id,
      dashboardUrl: projectStatus.dashboard_url,
      conditions
    }
  };
}
function sonarProjectStatusToQualityGateOptions(projectStatus, options = {}) {
  const conditions = projectStatus.conditions ?? [];
  const rules = conditions.map(mapSonarConditionToRule);
  const status = projectStatus.status ?? (projectStatus.ok || projectStatus.passed ? "OK" : "ERROR");
  const passed = options.passed ?? projectStatus.passed ?? projectStatus.ok ?? ["OK", "PASSED"].includes(String(status).toUpperCase());
  const projectKey = projectStatus.project_key ?? projectStatus.projectKey ?? options.source?.projectKey;
  const profile = options.profile ?? options.source?.profile;
  const displayRules = rules.length > 0 ? rules : [
    {
      id: "status",
      message: passed ? "Quality gate OK" : `Quality gate ${status}`,
      passed: Boolean(passed),
      actual: status,
      threshold: "OK",
      comparator: (
        /** @type {const} */
        "EQ"
      )
    }
  ];
  return {
    kind: (
      /** @type {const} */
      "sonar"
    ),
    testId: "sonar-quality-gate",
    passed: Boolean(passed),
    barTitle: options.barTitle ?? DEFAULT_BAR_TITLE,
    lang: options.lang ?? "ru",
    labels: options.labels ?? DEFAULT_LABELS2,
    rules: displayRules,
    config: {
      profile,
      projectKey,
      conditions: options.profileConditions ?? [],
      source: resolveSonarQgInfoSource(options.source, projectStatus, profile, projectKey)
    },
    infoPayload: buildSonarQualityGateInfoPayload(projectStatus, options)
  };
}

// src/SonarQualityGate.tsx
import { jsx as jsx46 } from "react/jsx-runtime";
function SonarQualityGate({
  projectStatus,
  profile,
  profileConditions,
  source,
  lang = "ru",
  barTitle = "Sonar Quality Gate",
  passed,
  rules,
  labels,
  className,
  "data-testid": dataTestId,
  ...rest
}) {
  const mapped = useMemo2(() => {
    const meta = {
      profile,
      profileConditions: profileConditions ? [...profileConditions] : void 0,
      source,
      lang,
      barTitle,
      passed,
      labels
    };
    const options = sonarProjectStatusToQualityGateOptions(
      projectStatus ?? {
        status: passed ? "OK" : "ERROR",
        passed,
        project_key: source?.projectKey,
        conditions: []
      },
      meta
    );
    return {
      passed: options.passed,
      lang: options.lang,
      barTitle: options.barTitle,
      config: options.config,
      labels: options.labels,
      infoPayload: projectStatus ? buildSonarQualityGateInfoPayload(projectStatus, meta) : options.infoPayload,
      rules: projectStatus ? (projectStatus.conditions ?? []).map(mapSonarConditionToRule) : rules ?? []
    };
  }, [
    projectStatus,
    profile,
    profileConditions,
    source,
    lang,
    barTitle,
    passed,
    labels,
    rules
  ]);
  return /* @__PURE__ */ jsx46(
    QualityGate,
    {
      ...rest,
      className,
      kind: "sonar",
      rules: mapped.rules,
      passed: mapped.passed,
      lang: mapped.lang,
      barTitle: mapped.barTitle,
      config: mapped.config,
      labels: mapped.labels,
      infoPayload: mapped.infoPayload,
      "data-testid": dataTestId
    }
  );
}

// src/PlaqueField.tsx
import { jsx as jsx47, jsxs as jsxs22 } from "react/jsx-runtime";
var PARAM_AUTOCOMPLETE = {
  authUser: "username",
  authPass: "current-password"
};
function resolveAutoComplete(autoComplete, paramId, labelVariant) {
  if (autoComplete !== void 0) {
    return autoComplete;
  }
  if (!paramId) {
    return void 0;
  }
  if (PARAM_AUTOCOMPLETE[paramId]) {
    return PARAM_AUTOCOMPLETE[paramId];
  }
  if (labelVariant === "param") {
    return "off";
  }
  return void 0;
}
function PlaqueField({
  label,
  className,
  divided = true,
  stretch = true,
  paramId,
  labelVariant = "caption",
  id,
  name,
  autoComplete,
  multiline = false,
  rows = 3,
  onChange,
  type,
  ...inputProps
}) {
  const labelClass = labelVariant === "param" ? "plaque-field__label" : "plaque-field__text";
  const controlId = id ?? paramId;
  const controlName = name ?? paramId ?? id;
  const resolvedAutoComplete = resolveAutoComplete(
    autoComplete,
    paramId,
    labelVariant
  );
  return /* @__PURE__ */ jsxs22(
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
        /* @__PURE__ */ jsx47("span", { className: labelClass, title: labelVariant === "param" ? label : void 0, children: label }),
        divided ? /* @__PURE__ */ jsx47("span", { className: "plaque-divider", "aria-hidden": "true" }) : null,
        multiline ? /* @__PURE__ */ jsx47(
          Textarea,
          {
            className: "plaque-field__control",
            ...inputProps,
            id: controlId,
            name: controlName,
            rows,
            autoComplete: resolvedAutoComplete,
            onChange
          }
        ) : /* @__PURE__ */ jsx47(
          Input,
          {
            className: "plaque-field__control",
            ...inputProps,
            type,
            id: controlId,
            name: controlName,
            autoComplete: resolvedAutoComplete,
            onChange
          }
        )
      ]
    }
  );
}

// src/PlaqueSelect.tsx
import { jsx as jsx48, jsxs as jsxs23 } from "react/jsx-runtime";
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
  const controlId = id ?? paramId;
  const controlName = paramId ?? id;
  return /* @__PURE__ */ jsxs23(
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
        /* @__PURE__ */ jsx48("span", { className: "plaque-field__label", title: label, children: label }),
        /* @__PURE__ */ jsx48("span", { className: "plaque-divider", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx48(
          "select",
          {
            className: "plaque-field__control",
            value,
            defaultValue: value === void 0 ? defaultValue : void 0,
            disabled,
            "aria-label": ariaLabel ?? label,
            onChange: handleChange,
            id: controlId,
            name: controlName,
            autoComplete: paramId ? "off" : void 0,
            children: options.map((option) => /* @__PURE__ */ jsx48("option", { value: option.value, children: option.label ?? option.value }, option.value))
          }
        )
      ]
    }
  );
}

// src/PlaqueNumber.tsx
import { useState as useState3 } from "react";
import { jsx as jsx49, jsxs as jsxs24 } from "react/jsx-runtime";
function finiteOr(value, fallback) {
  return value !== void 0 && Number.isFinite(value) ? value : fallback;
}
function stepValue(current, dir, step, min, max) {
  const stepVal = Number.isFinite(step) && step > 0 ? step : 1;
  const minB = finiteOr(min, -Infinity);
  const maxB = finiteOr(max, Infinity);
  let next = (current === void 0 || !Number.isFinite(current) ? 0 : current) + dir * stepVal;
  if (Number.isFinite(minB)) next = Math.max(minB, next);
  if (Number.isFinite(maxB)) next = Math.min(maxB, next);
  return next;
}
function PlaqueNumberGlyph({ dir }) {
  return /* @__PURE__ */ jsx49("svg", { viewBox: "0 0 10 10", "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ jsx49(
    "path",
    {
      d: dir < 0 ? "M2 5h6" : "M2 5h6M5 2v6",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round"
    }
  ) });
}
function PlaqueNumber({
  label,
  value,
  defaultValue,
  min,
  max,
  step = 1,
  onChange,
  paramId,
  disabled,
  stretch = true,
  id,
  "aria-label": ariaLabel,
  className,
  "data-testid": testId = "plaque-field-number"
}) {
  const isControlled = value !== void 0;
  const [internalValue, setInternalValue] = useState3(defaultValue);
  const current = isControlled ? value : internalValue;
  const controlId = id ?? paramId;
  const controlName = paramId ?? id;
  const numeric = current !== void 0 && Number.isFinite(current) ? current : NaN;
  const minB = finiteOr(min, -Infinity);
  const maxB = finiteOr(max, Infinity);
  const decDisabled = Boolean(disabled) || Number.isFinite(numeric) && Number.isFinite(minB) && numeric <= minB;
  const incDisabled = Boolean(disabled) || Number.isFinite(numeric) && Number.isFinite(maxB) && numeric >= maxB;
  const commit = (next) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
  };
  const handleInputChange = (event) => {
    const next = event.target.valueAsNumber;
    if (!Number.isFinite(next)) {
      return;
    }
    commit(next);
  };
  const handleStep = (dir) => {
    if (disabled) return;
    commit(stepValue(current, dir, step, min, max));
  };
  return /* @__PURE__ */ jsxs24(
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
        /* @__PURE__ */ jsx49("span", { className: "plaque-field__label", title: label, children: label }),
        /* @__PURE__ */ jsx49("span", { className: "plaque-divider", "aria-hidden": "true" }),
        /* @__PURE__ */ jsxs24("span", { className: "plaque-number", children: [
          /* @__PURE__ */ jsx49(
            "button",
            {
              type: "button",
              className: "plaque-number__btn",
              "data-plaque-number-dir": "-1",
              tabIndex: -1,
              "aria-label": "\u0423\u043C\u0435\u043D\u044C\u0448\u0438\u0442\u044C",
              disabled: decDisabled,
              onClick: (event) => {
                event.preventDefault();
                handleStep(-1);
              },
              children: /* @__PURE__ */ jsx49(PlaqueNumberGlyph, { dir: -1 })
            }
          ),
          /* @__PURE__ */ jsx49(
            "input",
            {
              id: controlId,
              name: controlName,
              type: "number",
              className: "plaque-field__control",
              value: current === void 0 ? "" : current,
              min,
              max,
              step,
              disabled,
              "aria-label": ariaLabel ?? label,
              autoComplete: paramId ? "off" : void 0,
              onChange: handleInputChange
            }
          ),
          /* @__PURE__ */ jsx49(
            "button",
            {
              type: "button",
              className: "plaque-number__btn",
              "data-plaque-number-dir": "1",
              tabIndex: -1,
              "aria-label": "\u0423\u0432\u0435\u043B\u0438\u0447\u0438\u0442\u044C",
              disabled: incDisabled,
              onClick: (event) => {
                event.preventDefault();
                handleStep(1);
              },
              children: /* @__PURE__ */ jsx49(PlaqueNumberGlyph, { dir: 1 })
            }
          )
        ] })
      ]
    }
  );
}

// src/PlaqueFieldSeg.tsx
import { useState as useState4 } from "react";
import { jsx as jsx50, jsxs as jsxs25 } from "react/jsx-runtime";
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
  const [internalValue, setInternalValue] = useState4(
    () => defaultValue ?? options[0].value
  );
  const selected = isControlled ? value : internalValue;
  const select = (next) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };
  return /* @__PURE__ */ jsxs25(
    "div",
    {
      className: cn("plaque-field", "plaque-field--divided", className),
      "data-param-id": paramId,
      "data-testid": testId,
      children: [
        /* @__PURE__ */ jsx50("span", { className: "plaque-field__label", title: label, children: label }),
        /* @__PURE__ */ jsx50("span", { className: "plaque-divider", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx50("div", { className: "plaque-field-seg-track plaque-field-seg-track--many plaque-field__control", children: /* @__PURE__ */ jsx50("div", { className: "plaque-field-seg", role: "radiogroup", "aria-label": ariaLabel ?? label, children: options.map((option) => {
          const on = option.value === selected;
          return /* @__PURE__ */ jsx50(
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

// src/PlaqueFieldSegN.tsx
import { useState as useState5 } from "react";
import { jsx as jsx51, jsxs as jsxs26 } from "react/jsx-runtime";
function PlaqueFieldSegN({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  paramId,
  "aria-label": ariaLabel,
  className,
  "data-testid": testId
}) {
  const isControlled = value !== void 0;
  const [internalValue, setInternalValue] = useState5(
    () => defaultValue ?? options[0].value
  );
  const selected = isControlled ? value : internalValue;
  const select = (next) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };
  return /* @__PURE__ */ jsxs26(
    "div",
    {
      className: cn("plaque-field", "plaque-field--divided", className),
      "data-param-id": paramId,
      "data-testid": testId,
      children: [
        /* @__PURE__ */ jsx51("span", { className: "plaque-field__label", title: label, children: label }),
        /* @__PURE__ */ jsx51("span", { className: "plaque-divider", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx51("div", { className: "plaque-field-seg-track plaque-field-seg-track--many plaque-field__control", children: /* @__PURE__ */ jsx51("div", { className: "plaque-field-seg", role: "radiogroup", "aria-label": ariaLabel ?? label, children: options.map((option) => {
          const on = option.value === selected;
          return /* @__PURE__ */ jsx51(
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

// src/PlaqueFieldOptionList.tsx
import { useState as useState6 } from "react";
import { jsx as jsx52 } from "react/jsx-runtime";
function PlaqueFieldOptionList({
  options,
  value,
  defaultValue,
  onValueChange,
  paramId,
  "aria-label": ariaLabel,
  className,
  "data-testid": testId
}) {
  const isControlled = value !== void 0;
  const [internalValue, setInternalValue] = useState6(
    () => defaultValue ?? options[0].value
  );
  const selected = isControlled ? value : internalValue;
  const select = (next) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };
  return /* @__PURE__ */ jsx52(
    "div",
    {
      className: cn("plaque-field-list", "plaque-field-list--dense", className),
      role: "radiogroup",
      "aria-label": ariaLabel ?? paramId,
      "data-param-id": paramId,
      "data-testid": testId,
      children: options.map((option) => {
        const on = option.value === selected;
        return /* @__PURE__ */ jsx52(
          "button",
          {
            type: "button",
            className: cn("plaque-field-option", on && "plaque-field-option--on"),
            "data-value": option.value,
            "aria-pressed": on,
            title: option.title,
            onClick: () => select(option.value),
            children: option.label ?? option.value
          },
          option.value
        );
      })
    }
  );
}

// src/PlaqueTagstrip.tsx
import { jsx as jsx53, jsxs as jsxs27 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs27(
    "div",
    {
      className: cn("plaque-field", "plaque-field--divided", className),
      "data-param-id": paramId,
      "data-testid": testId,
      children: [
        /* @__PURE__ */ jsx53("span", { className: "plaque-field__label", title: label, children: label }),
        /* @__PURE__ */ jsx53("span", { className: "plaque-divider", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx53("div", { className: "plaque-field-seg-track plaque-field-seg-track--many plaque-field__control", children: /* @__PURE__ */ jsx53("div", { className: "plaque-field-seg", role: "group", "aria-label": ariaLabel ?? label, children: options.map((option) => {
          const on = values.includes(option.value);
          return /* @__PURE__ */ jsx53(
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
import { Children as Children3, isValidElement } from "react";

// src/usePlaqueFieldMagnet.ts
import { useEffect as useEffect4 } from "react";
var EMBED_MARKER = "data-plaque-magnet-embed";
function usePlaqueFieldMagnet({
  enabled = true,
  scriptSrc = "/js/plaque-field-magnet.js",
  syncKey
} = {}) {
  useEffect4(() => {
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
import { jsx as jsx54 } from "react/jsx-runtime";
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
    syncKey: Children3.count(children)
  });
  const cells = wrapCells ? Children3.map(
    children,
    (child, index) => isValidElement(child) ? /* @__PURE__ */ jsx54("div", { className: "plaque-field-grid__cell", children: child }, child.key ?? index) : child
  ) : children;
  return /* @__PURE__ */ jsx54(
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
import { Children as Children4, isValidElement as isValidElement2 } from "react";
import { jsx as jsx55 } from "react/jsx-runtime";
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
    syncKey: Children4.count(children)
  });
  const cellClass = cn("plaque-field-grid__cell", cellSpan && `plaque-field-grid__cell--${cellSpan}`);
  const cells = wrapCells ? Children4.map(
    children,
    (child, index) => isValidElement2(child) ? /* @__PURE__ */ jsx55("div", { className: cellClass, children: child }, child.key ?? index) : child
  ) : children;
  const grid = /* @__PURE__ */ jsx55(
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
    return /* @__PURE__ */ jsx55("div", { className: "plaque-field-grid-stack plaque-field-grid-stack--magnet", children: grid });
  }
  return grid;
}

// src/PlaqueFieldGridStack.tsx
import { Children as Children5 } from "react";
import { jsx as jsx56 } from "react/jsx-runtime";
function PlaqueFieldGridStack({
  children,
  align = "magnet",
  magnetScriptSrc,
  syncKey,
  "aria-label": ariaLabel,
  className,
  "data-testid": testId
}) {
  const magnet = align === "magnet";
  usePlaqueFieldMagnet({
    enabled: magnet,
    scriptSrc: magnetScriptSrc,
    syncKey: syncKey ?? Children5.count(children)
  });
  return /* @__PURE__ */ jsx56(
    "div",
    {
      className: cn(
        "plaque-field-grid-stack",
        magnet && "plaque-field-grid-stack--magnet",
        align === "hug" && "plaque-field-grid-stack--hug",
        className
      ),
      role: ariaLabel ? "group" : void 0,
      "aria-label": ariaLabel,
      "data-testid": testId,
      children
    }
  );
}

// src/ThemeToggle.tsx
import { useCallback as useCallback3, useEffect as useEffect5, useState as useState7 } from "react";

// src/theme-icons.tsx
import { jsx as jsx57, jsxs as jsxs28 } from "react/jsx-runtime";
function ThemeIconSun() {
  return /* @__PURE__ */ jsxs28("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsx57("circle", { cx: "12", cy: "12", r: "4" }),
    /* @__PURE__ */ jsx57("path", { d: "M12 2v2" }),
    /* @__PURE__ */ jsx57("path", { d: "M12 20v2" }),
    /* @__PURE__ */ jsx57("path", { d: "M4.93 4.93l1.41 1.41" }),
    /* @__PURE__ */ jsx57("path", { d: "M17.66 17.66l1.41 1.41" }),
    /* @__PURE__ */ jsx57("path", { d: "M2 12h2" }),
    /* @__PURE__ */ jsx57("path", { d: "M20 12h2" }),
    /* @__PURE__ */ jsx57("path", { d: "M4.93 19.07l1.41-1.41" }),
    /* @__PURE__ */ jsx57("path", { d: "M17.66 6.34l1.41-1.41" })
  ] });
}
function ThemeIconMoon() {
  return /* @__PURE__ */ jsx57("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx57("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" }) });
}

// src/ThemeToggle.tsx
import { jsx as jsx58 } from "react/jsx-runtime";
var HEADER_THEME_CHANGE = "header:theme-change";
var THEME_STORAGE_KEY = "zds-theme";
function isTheme(value) {
  return value === "light" || value === "dark";
}
function readTheme(storageKey) {
  if (typeof document === "undefined") {
    return "dark";
  }
  try {
    const stored = localStorage.getItem(storageKey);
    if (isTheme(stored)) {
      return stored;
    }
  } catch {
  }
  return document.documentElement.classList.contains("theme-light") ? "light" : "dark";
}
function persistTheme(storageKey, theme) {
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
  }
}
function applyTheme(theme, storageKey) {
  document.documentElement.classList.toggle("theme-light", theme === "light");
  persistTheme(storageKey, theme);
  document.dispatchEvent(new CustomEvent(HEADER_THEME_CHANGE, { detail: { theme } }));
}
function ThemeToggle({
  className,
  testId = "header-theme-toggle",
  storageKey = THEME_STORAGE_KEY
}) {
  const [theme, setTheme] = useState7(() => readTheme(storageKey));
  useEffect5(() => {
    applyTheme(theme, storageKey);
  }, [theme, storageKey]);
  const toggle = useCallback3(() => {
    setTheme((current) => current === "light" ? "dark" : "light");
  }, []);
  const isLight = theme === "light";
  return /* @__PURE__ */ jsx58(
    "button",
    {
      type: "button",
      className: cn("icon-btn", className),
      "data-testid": testId,
      "aria-label": isLight ? "Switch to dark theme" : "Switch to light theme",
      onClick: toggle,
      children: /* @__PURE__ */ jsx58("span", { className: "icon", "aria-hidden": "true", children: isLight ? /* @__PURE__ */ jsx58(ThemeIconSun, {}) : /* @__PURE__ */ jsx58(ThemeIconMoon, {}) })
    }
  );
}

// src/panel-icons.tsx
import { jsx as jsx59, jsxs as jsxs29 } from "react/jsx-runtime";
function IconReset() {
  return /* @__PURE__ */ jsxs29(
    "svg",
    {
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsx59("path", { d: "M2.5 8a5.5 5.5 0 1 0 5.5-5.5 6 6 0 0 0-4.1 1.83L2.5 3.5" }),
        /* @__PURE__ */ jsx59("path", { d: "M2.5 2.5v3h3" })
      ]
    }
  );
}
function IconCopy() {
  return /* @__PURE__ */ jsxs29("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ jsx59("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ jsx59(
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
  return /* @__PURE__ */ jsxs29(
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
        /* @__PURE__ */ jsx59("path", { d: "M8 2.5v7" }),
        /* @__PURE__ */ jsx59("path", { d: "m5.25 7 2.75 2.75L10.75 7" }),
        /* @__PURE__ */ jsx59("path", { d: "M3 11v1.5A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5V11" })
      ]
    }
  );
}

// src/tool-icons.tsx
import { jsx as jsx60, jsxs as jsxs30 } from "react/jsx-runtime";
function IconSwagger() {
  return /* @__PURE__ */ jsxs30(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        /* @__PURE__ */ jsx60("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ jsx60("path", { d: "M8.8 8.3c-1.1 0-1.75.65-1.75 1.6v.8c0 .42-.3.68-.8.78.5.1.8.36.8.78v.8c0 .95.65 1.6 1.75 1.6" }),
        /* @__PURE__ */ jsx60("path", { d: "M15.2 8.3c1.1 0 1.75.65 1.75 1.6v.8c0 .42.3.68.8.78-.5.1-.8.36-.8.78v.8c0 .95-.65 1.6-1.75 1.6" }),
        /* @__PURE__ */ jsx60("path", { d: "M10.2 12h.01M12 12h.01M13.8 12h.01", strokeWidth: "1.8" })
      ]
    }
  );
}

// src/WindowControl.tsx
import { jsx as jsx61 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsx61(
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
      children: /* @__PURE__ */ jsx61("span", { className: "icon", "aria-hidden": "true", children })
    }
  );
}

// src/vnc-icons.tsx
import { Fragment as Fragment2, jsx as jsx62, jsxs as jsxs31 } from "react/jsx-runtime";
function IconClose() {
  return /* @__PURE__ */ jsx62("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: /* @__PURE__ */ jsx62("path", { d: "m4 4 8 8M12 4l-8 8" }) });
}
function IconStop() {
  return /* @__PURE__ */ jsx62(
    "svg",
    {
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ jsx62("rect", { x: "4.5", y: "4.5", width: "7", height: "7", rx: "1.25" })
    }
  );
}
function IconTrash() {
  return /* @__PURE__ */ jsxs31(
    "svg",
    {
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsx62("path", { d: "M2.5 4.5h11" }),
        /* @__PURE__ */ jsx62("path", { d: "M6 4.5V3.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1" }),
        /* @__PURE__ */ jsx62("path", { d: "M4.5 4.5l.7 8a1.5 1.5 0 0 0 1.5 1.3h3.6a1.5 1.5 0 0 0 1.5-1.3l.7-8" }),
        /* @__PURE__ */ jsx62("path", { d: "M6.5 7v4M9.5 7v4" })
      ]
    }
  );
}
function IconDocumentRemove() {
  return /* @__PURE__ */ jsxs31(
    "svg",
    {
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsx62("path", { d: "M4 2.5h5l3 3v8H4z" }),
        /* @__PURE__ */ jsx62("path", { d: "M9 2.5v3h3M6 10h4" })
      ]
    }
  );
}
function IconDotsHorizontal() {
  return /* @__PURE__ */ jsx62("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: /* @__PURE__ */ jsx62("path", { d: "M3 8h.01M8 8h.01M13 8h.01" }) });
}
function IconLock() {
  return /* @__PURE__ */ jsxs31(
    "svg",
    {
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsx62("rect", { x: "3.5", y: "7", width: "9", height: "6.5", rx: "1.5" }),
        /* @__PURE__ */ jsx62("path", { d: "M5.5 7V5a2.5 2.5 0 0 1 5 0v2" })
      ]
    }
  );
}
function IconUnlock() {
  return /* @__PURE__ */ jsxs31(
    "svg",
    {
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsx62("rect", { x: "3.5", y: "7", width: "9", height: "6.5", rx: "1.5" }),
        /* @__PURE__ */ jsx62("path", { d: "M10.5 7V5a2.5 2.5 0 0 0-4.75-1.1" })
      ]
    }
  );
}
function IconChevronUp() {
  return /* @__PURE__ */ jsx62(
    "svg",
    {
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ jsx62("path", { d: "m4 10 4-4 4 4" })
    }
  );
}
function IconChevronDown() {
  return /* @__PURE__ */ jsx62(
    "svg",
    {
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ jsx62("path", { d: "m4 6 4 4 4-4" })
    }
  );
}
function IconFullscreen() {
  return /* @__PURE__ */ jsxs31(
    "svg",
    {
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsx62("path", { d: "M3 6.25V3h3.25" }),
        /* @__PURE__ */ jsx62("path", { d: "M13 6.25V3h-3.25" }),
        /* @__PURE__ */ jsx62("path", { d: "M3 9.75V13h3.25" }),
        /* @__PURE__ */ jsx62("path", { d: "M13 9.75V13h-3.25" })
      ]
    }
  );
}
function IconFullscreenExit() {
  return /* @__PURE__ */ jsxs31(
    "svg",
    {
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsx62("path", { d: "M6.25 3v3.25H3" }),
        /* @__PURE__ */ jsx62("path", { d: "M9.75 3v3.25H13" }),
        /* @__PURE__ */ jsx62("path", { d: "M6.25 13v-3.25H3" }),
        /* @__PURE__ */ jsx62("path", { d: "M9.75 13v-3.25H13" })
      ]
    }
  );
}
function IconVncCopy() {
  return /* @__PURE__ */ jsxs31("svg", { viewBox: "0 0 16 16", fill: "none", children: [
    /* @__PURE__ */ jsx62("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ jsx62(
      "path",
      {
        d: "M5 11H4a1.5 1.5 0 0 1-1.5-1.5V4A1.5 1.5 0 0 1 4 2.5h5.5A1.5 1.5 0 0 1 11 4v1",
        stroke: "currentColor",
        strokeWidth: "1.5"
      }
    )
  ] });
}
var clipboardSheets = /* @__PURE__ */ jsxs31(Fragment2, { children: [
  /* @__PURE__ */ jsx62("rect", { x: "4", y: "4.5", width: "6.25", height: "8", rx: "1.25", stroke: "currentColor", strokeWidth: "1.5" }),
  /* @__PURE__ */ jsx62(
    "path",
    {
      d: "M4 10.75H3.25A1.25 1.25 0 0 1 2 9.5V3.5A1.25 1.25 0 0 1 3.25 2.25h4.25A1.25 1.25 0 0 1 8.75 3.5V4.5",
      stroke: "currentColor",
      strokeWidth: "1.5"
    }
  )
] });
function IconCopyOut() {
  return /* @__PURE__ */ jsxs31("svg", { viewBox: "0 0 16 16", fill: "none", children: [
    clipboardSheets,
    /* @__PURE__ */ jsx62(
      "path",
      {
        d: "M11.25 8.5H14.5M13 6.75 14.75 8.5 13 10.25",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    )
  ] });
}
function IconCopyIn() {
  return /* @__PURE__ */ jsxs31("svg", { viewBox: "0 0 16 16", fill: "none", children: [
    clipboardSheets,
    /* @__PURE__ */ jsx62(
      "path",
      {
        d: "M14.5 8.5H11.25M12.75 6.75 11 8.5 12.75 10.25",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    )
  ] });
}
function IconUpload() {
  return /* @__PURE__ */ jsxs31(
    "svg",
    {
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsx62("path", { d: "M8 10V3m0 0L5.25 5.75M8 3l2.75 2.75" }),
        /* @__PURE__ */ jsx62("path", { d: "M3 10v2.5A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5V10" })
      ]
    }
  );
}

// src/ConnectionStatus.tsx
import { jsx as jsx63 } from "react/jsx-runtime";
function ConnectionStatus({
  state,
  className,
  role = "status",
  "aria-label": ariaLabel,
  ...rest
}) {
  const glyph = state === "connected" ? null : state === "disconnected" ? /* @__PURE__ */ jsx63(IconDocumentRemove, {}) : /* @__PURE__ */ jsx63(IconDotsHorizontal, {});
  return /* @__PURE__ */ jsx63(
    "span",
    {
      role,
      "aria-label": ariaLabel ?? `VNC ${state}`,
      className: cn("connection-status", `connection-status--${state}`, className),
      ...rest,
      children: glyph && /* @__PURE__ */ jsx63("span", { className: "icon", "aria-hidden": "true", children: glyph })
    }
  );
}

// src/VncWindow.tsx
import { jsx as jsx64, jsxs as jsxs32 } from "react/jsx-runtime";
var defaultLabels = {
  back: "Back",
  lock: "Lock screen",
  unlock: "Unlock screen",
  enterFullscreen: "Enter fullscreen",
  exitFullscreen: "Exit fullscreen",
  copy: "Copy from session",
  paste: "Paste into session",
  download: "Download",
  kill: "Kill container",
  title: "VNC window",
  view: "view",
  control: "control"
};
function VncBarAction({
  label,
  sessionControl,
  onClick,
  testId,
  children
}) {
  return /* @__PURE__ */ jsx64(
    "button",
    {
      type: "button",
      className: cn("icon-btn", "panel__action", sessionControl && "vnc-window__session-control"),
      "aria-label": label,
      title: label,
      "data-testid": testId,
      onClick,
      children: /* @__PURE__ */ jsx64("span", { className: "icon", "aria-hidden": "true", children })
    }
  );
}
function VncWindow({
  state,
  fullscreen = false,
  unlocked = false,
  screenSize,
  back,
  kill,
  onBack,
  onToggleLock,
  onToggleFullscreen,
  onCopy,
  onPaste,
  onDownload,
  onKill,
  children,
  labels,
  className,
  "data-testid": dataTestId = "vnc-window",
  titleTestId = "vnc-window-title"
}) {
  const l = { ...defaultLabels, ...labels };
  const titleText = state === "connected" ? `${l.title} (${unlocked ? l.control : l.view})` : l.title;
  const aspectStyle = screenSize && screenSize.width > 0 && screenSize.height > 0 ? {
    ["--vnc-aspect"]: `${screenSize.width} / ${screenSize.height}`
  } : void 0;
  const backControl = back !== void 0 ? back : onBack ? /* @__PURE__ */ jsx64(VncBarAction, { label: l.back, onClick: onBack, children: /* @__PURE__ */ jsx64(IconClose, {}) }) : null;
  const killControl = kill ?? (onKill ? /* @__PURE__ */ jsx64(VncBarAction, { label: l.kill, sessionControl: true, onClick: onKill, children: /* @__PURE__ */ jsx64(IconTrash, {}) }) : null);
  return /* @__PURE__ */ jsx64("div", { className: cn("vnc-window-frame", fullscreen && "vnc-window-frame--fullscreen"), children: /* @__PURE__ */ jsxs32(
    "div",
    {
      className: cn(
        "panel",
        "panel--terminal",
        "panel--vnc",
        "vnc-window",
        `vnc-window--${state}`,
        fullscreen && "vnc-window--fullscreen",
        className
      ),
      style: aspectStyle,
      "data-state": state,
      "data-testid": dataTestId,
      role: "region",
      "aria-label": titleText,
      children: [
        /* @__PURE__ */ jsxs32("div", { className: "panel__bar", children: [
          /* @__PURE__ */ jsxs32("div", { className: "panel__dots", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsx64("span", { className: "panel__dot" }),
            /* @__PURE__ */ jsx64("span", { className: "panel__dot" }),
            /* @__PURE__ */ jsx64("span", { className: "panel__dot" })
          ] }),
          /* @__PURE__ */ jsxs32("div", { className: "panel__trail", children: [
            /* @__PURE__ */ jsx64("span", { className: "panel__title vnc-window__title", "data-testid": titleTestId, children: titleText }),
            state !== "connected" ? /* @__PURE__ */ jsx64("span", { className: "vnc-window__status-label", "aria-hidden": "true", children: state }) : null
          ] }),
          /* @__PURE__ */ jsxs32("div", { className: "panel__actions vnc-window__actions", children: [
            backControl,
            /* @__PURE__ */ jsx64(
              VncBarAction,
              {
                label: unlocked ? l.lock : l.unlock,
                sessionControl: true,
                onClick: onToggleLock,
                children: unlocked ? /* @__PURE__ */ jsx64(IconUnlock, {}) : /* @__PURE__ */ jsx64(IconLock, {})
              }
            ),
            killControl,
            /* @__PURE__ */ jsx64(VncBarAction, { label: l.copy, sessionControl: true, onClick: onCopy, children: /* @__PURE__ */ jsx64(IconCopyOut, {}) }),
            /* @__PURE__ */ jsx64(VncBarAction, { label: l.paste, sessionControl: true, onClick: onPaste, children: /* @__PURE__ */ jsx64(IconCopyIn, {}) }),
            /* @__PURE__ */ jsx64(
              VncBarAction,
              {
                label: fullscreen ? l.exitFullscreen : l.enterFullscreen,
                sessionControl: true,
                onClick: onToggleFullscreen,
                children: fullscreen ? /* @__PURE__ */ jsx64(IconFullscreenExit, {}) : /* @__PURE__ */ jsx64(IconFullscreen, {})
              }
            ),
            onDownload ? /* @__PURE__ */ jsx64(VncBarAction, { label: l.download, testId: "vnc-window-download", onClick: onDownload, children: /* @__PURE__ */ jsx64(IconDownload, {}) }) : null
          ] })
        ] }),
        /* @__PURE__ */ jsx64("div", { className: "vnc-window__screen", children: /* @__PURE__ */ jsx64("div", { className: "vnc-window__screen-mount", "aria-label": "noVNC mount point", children }) })
      ]
    }
  ) });
}

// src/HarViewer.tsx
import { Fragment as Fragment3 } from "react";
import { jsx as jsx65, jsxs as jsxs33 } from "react/jsx-runtime";
var HAR_TIMING_KEYS = [
  "blocked",
  "dns",
  "connect",
  "ssl",
  "send",
  "wait",
  "receive"
];
function formatSize(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) {
    return "\u2014";
  }
  if (v < 1024) {
    return `${v} B`;
  }
  if (v < 1024 * 1024) {
    return `${(v / 1024).toFixed(1)} KB`;
  }
  return `${(v / (1024 * 1024)).toFixed(1)} MB`;
}
function formatTiming(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v < 0) {
    return "\u2014";
  }
  return `${Math.round(v)} ms`;
}
function harStatusClass(status) {
  const s = Number(status);
  if (s >= 500) {
    return "har-status--err";
  }
  if (s >= 400) {
    return "har-status--warn";
  }
  if (s >= 300) {
    return "har-status--redir";
  }
  if (s > 0) {
    return "har-status--ok";
  }
  return "har-status--muted";
}
function headerPairs(headers) {
  if (!Array.isArray(headers)) {
    return [];
  }
  return headers.filter((h) => h && (h.name != null || h.value != null)).map((h) => ({ name: String(h.name || ""), value: String(h.value ?? "") }));
}
function HeaderKv({ title, headers }) {
  const pairs = headerPairs(headers);
  return /* @__PURE__ */ jsxs33("div", { className: "har-section", children: [
    /* @__PURE__ */ jsx65("div", { className: "har-section__title", children: title }),
    pairs.length === 0 ? /* @__PURE__ */ jsx65("div", { className: "har-muted", children: "No headers captured." }) : /* @__PURE__ */ jsx65("div", { className: "har-kv", children: pairs.map((h, i) => /* @__PURE__ */ jsxs33(Fragment3, { children: [
      /* @__PURE__ */ jsx65("div", { className: "har-kv__k", children: h.name }),
      /* @__PURE__ */ jsx65("div", { className: "har-kv__v", children: h.value || "\u2014" })
    ] }, `${h.name}-${i}`)) })
  ] });
}
var TABS = [
  { id: "headers", label: "Headers" },
  { id: "timings", label: "Timings" },
  { id: "response", label: "Response" }
];
function EntryDetail({
  entry,
  tab,
  onTabChange
}) {
  const req = entry.request || {};
  const resp = entry.response || {};
  const content = resp.content || {};
  const timings = entry.timings || {};
  const status = Number(resp.status) || 0;
  const statusText = resp.statusText || "";
  const mime = content.mimeType || "\u2014";
  const size = formatSize(content.size);
  const bodyText = typeof content.text === "string" ? content.text : "";
  const bodyNote = bodyText ? bodyText : "Body not captured (meta / headers + size only).";
  return /* @__PURE__ */ jsxs33("div", { className: "har-detail", "data-testid": "session-har-detail", children: [
    /* @__PURE__ */ jsx65("div", { className: "har-tabs", role: "tablist", "aria-label": "HAR entry details", children: TABS.map((t) => /* @__PURE__ */ jsx65(
      "button",
      {
        type: "button",
        role: "tab",
        className: tab === t.id ? "har-tab har-tab--active" : "har-tab",
        "aria-selected": tab === t.id,
        "data-testid": `session-har-tab-${t.id}`,
        onClick: (e) => {
          e.stopPropagation();
          onTabChange(t.id);
        },
        children: t.label
      },
      t.id
    )) }),
    tab === "headers" && /* @__PURE__ */ jsxs33("div", { className: "har-tab-panel", role: "tabpanel", "data-testid": "session-har-panel-headers", children: [
      /* @__PURE__ */ jsx65(HeaderKv, { title: "Response Headers", headers: resp.headers }),
      /* @__PURE__ */ jsx65(HeaderKv, { title: "Request Headers", headers: req.headers })
    ] }),
    tab === "timings" && /* @__PURE__ */ jsx65("div", { className: "har-tab-panel", role: "tabpanel", "data-testid": "session-har-panel-timings", children: /* @__PURE__ */ jsxs33("div", { className: "har-kv", children: [
      HAR_TIMING_KEYS.map((key) => /* @__PURE__ */ jsxs33(Fragment3, { children: [
        /* @__PURE__ */ jsx65("div", { className: "har-kv__k", children: key }),
        /* @__PURE__ */ jsx65("div", { className: "har-kv__v", children: formatTiming(timings[key]) })
      ] }, key)),
      /* @__PURE__ */ jsx65("div", { className: "har-kv__k", children: "total" }),
      /* @__PURE__ */ jsx65("div", { className: "har-kv__v", children: formatTiming(entry.time) })
    ] }) }),
    tab === "response" && /* @__PURE__ */ jsxs33("div", { className: "har-tab-panel", role: "tabpanel", "data-testid": "session-har-panel-response", children: [
      /* @__PURE__ */ jsxs33("div", { className: "har-kv", children: [
        /* @__PURE__ */ jsx65("div", { className: "har-kv__k", children: "status" }),
        /* @__PURE__ */ jsxs33("div", { className: "har-kv__v", children: [
          status || "\u2014",
          statusText ? ` ${statusText}` : ""
        ] }),
        /* @__PURE__ */ jsx65("div", { className: "har-kv__k", children: "mimeType" }),
        /* @__PURE__ */ jsx65("div", { className: "har-kv__v", children: mime }),
        /* @__PURE__ */ jsx65("div", { className: "har-kv__k", children: "size" }),
        /* @__PURE__ */ jsx65("div", { className: "har-kv__v", children: size })
      ] }),
      /* @__PURE__ */ jsxs33("div", { className: "har-section", children: [
        /* @__PURE__ */ jsx65("div", { className: "har-section__title", children: "Body" }),
        /* @__PURE__ */ jsx65("pre", { className: bodyText ? "har-body" : "har-body har-muted", children: bodyNote })
      ] })
    ] })
  ] });
}
function HarViewer({
  entries,
  expandedIndex = null,
  detailTab = "headers",
  onToggleRow,
  onDetailTabChange,
  empty,
  className,
  testId = "har-viewer"
}) {
  if (!entries.length) {
    return /* @__PURE__ */ jsx65("div", { className: cn("har-viewer", className), "data-testid": testId, children: /* @__PURE__ */ jsx65("div", { className: "har-empty", "data-testid": "session-har-empty", children: empty ?? "No network entries." }) });
  }
  return /* @__PURE__ */ jsx65("div", { className: cn("har-viewer", className), "data-testid": testId, children: /* @__PURE__ */ jsx65("div", { className: "har-table-wrap", children: /* @__PURE__ */ jsxs33("table", { className: "har-table", children: [
    /* @__PURE__ */ jsx65("thead", { children: /* @__PURE__ */ jsxs33("tr", { children: [
      /* @__PURE__ */ jsx65("th", { children: "Method" }),
      /* @__PURE__ */ jsx65("th", { children: "Status" }),
      /* @__PURE__ */ jsx65("th", { children: "URL" }),
      /* @__PURE__ */ jsx65("th", { children: "Type" }),
      /* @__PURE__ */ jsx65("th", { children: "Size" }),
      /* @__PURE__ */ jsx65("th", { children: "Time" })
    ] }) }),
    /* @__PURE__ */ jsx65("tbody", { children: entries.map((entry, idx) => {
      const req = entry.request || {};
      const resp = entry.response || {};
      const content = resp.content || {};
      const status = Number(resp.status) || 0;
      const open = expandedIndex === idx;
      const rowId = `har-row-${idx}`;
      return /* @__PURE__ */ jsxs33(Fragment3, { children: [
        /* @__PURE__ */ jsxs33(
          "tr",
          {
            id: rowId,
            className: open ? "har-row har-row--open" : "har-row",
            tabIndex: 0,
            role: "button",
            "aria-expanded": open,
            "aria-controls": `har-detail-${idx}`,
            "data-testid": `session-har-row-${idx}`,
            onClick: () => onToggleRow?.(idx),
            onKeyDown: (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggleRow?.(idx);
              }
            },
            children: [
              /* @__PURE__ */ jsx65("td", { className: "har-method", children: req.method || "" }),
              /* @__PURE__ */ jsx65("td", { className: harStatusClass(status), children: status || "\u2014" }),
              /* @__PURE__ */ jsx65("td", { className: "har-url", title: req.url, children: req.url || "" }),
              /* @__PURE__ */ jsx65("td", { className: "har-mime", children: content.mimeType || "\u2014" }),
              /* @__PURE__ */ jsx65("td", { children: formatSize(content.size) }),
              /* @__PURE__ */ jsxs33("td", { children: [
                Math.round(Number(entry.time) || 0),
                " ms"
              ] })
            ]
          }
        ),
        open && /* @__PURE__ */ jsx65(
          "tr",
          {
            id: `har-detail-${idx}`,
            className: "har-detail-row",
            "data-testid": `session-har-detail-row-${idx}`,
            children: /* @__PURE__ */ jsx65(
              "td",
              {
                colSpan: 6,
                onClick: (e) => e.stopPropagation(),
                children: /* @__PURE__ */ jsx65(
                  EntryDetail,
                  {
                    entry,
                    tab: detailTab,
                    onTabChange: (t) => onDetailTabChange?.(t)
                  }
                )
              }
            )
          }
        )
      ] }, `${req.method || "GET"}-${req.url || ""}-${idx}`);
    }) })
  ] }) }) });
}
export {
  AllureLogo,
  AppHeader,
  Badge,
  BrandAttribution,
  BrandLogo,
  Button,
  Callout,
  ChartTile,
  Checkbox,
  CheckboxCard,
  CheckboxGroup,
  Chip,
  CodeHighlight,
  ConnectionStatus,
  FieldCaption,
  Grid,
  HAR_TIMING_KEYS,
  HEADER_LANG_CHANGE,
  HEADER_THEME_CHANGE,
  HarViewer,
  Icon,
  IconBtn,
  IconChevronDown,
  IconChevronUp,
  IconClose,
  IconCopy,
  IconCopyIn,
  IconCopyOut,
  IconDocumentRemove,
  IconDotsHorizontal,
  IconDownload,
  IconFullscreen,
  IconFullscreenExit,
  IconLock,
  IconReset,
  IconStop,
  IconSwagger,
  IconTrash,
  IconUnlock,
  IconUpload,
  IconVncCopy,
  Indicator,
  IndicatorRow,
  Input,
  LANG_STORAGE_KEY,
  Label,
  LangIcon,
  LangToggle,
  Link,
  POLL_DEFAULT_MS,
  Panel,
  PlaqueDivider,
  PlaqueField,
  PlaqueFieldGrid,
  PlaqueFieldGridStack,
  PlaqueFieldOptionList,
  PlaqueFieldSeg,
  PlaqueFieldSegGrid,
  PlaqueFieldSegN,
  PlaqueNumber,
  PlaqueSelect,
  PlaqueTagstrip,
  PollIcon,
  PollToggle,
  QaGuruLogo,
  QgInfo,
  QualityGate,
  Radio,
  RadioCard,
  RadioGroup,
  Section,
  SegmentedControl,
  SegmentedControlBtn,
  Select,
  SelenoidDashboardRow,
  SelenoidMetrics,
  SessionKill,
  SonarQualityGate,
  Sparkline,
  StabilityCell,
  Stack,
  Status,
  StatusTile,
  THEME_STORAGE_KEY,
  Tab,
  Tabs,
  TestsTable,
  Text,
  Textarea,
  ThemeIconMoon,
  ThemeIconSun,
  ThemeToggle,
  VncWindow,
  WidgetMosaic,
  WidgetTile,
  WindowControl,
  buildSonarQualityGateInfoPayload,
  escapeHtml,
  formatPollLabel,
  formatSize,
  formatTiming,
  harStatusClass,
  highlightCurlHeredoc,
  highlightJson,
  highlightMarkdown,
  highlightOutput,
  highlightShell,
  mapSonarConditionToRule,
  mountHighlightedOutput,
  sonarProjectStatusToQualityGateOptions,
  sparklineThemeFromSite,
  stabilityStatusLabel,
  trimOutputBlankLines,
  usePlaqueFieldMagnet
};
//# sourceMappingURL=index.js.map