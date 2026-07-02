/**
 * Selenoid UI v2 — same QA.GURU header shell as one-page-form + live metrics.
 * Standalone preview: header-preview.html
 */

const RESPONSIVE_BREAKPOINT_PX = 768;

const QA_GURU_LOGO_SVG = `<svg class="default-logo" width="140" height="26" viewBox="0 0 140 26" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-hidden="true"><path d="M76.1067 14.8843C74.3621 13.3041 73.5068 11.2774 73.5068 8.78693C73.5068 6.2965 74.3962 4.25261 76.1238 2.68964C77.8514 1.12666 80.075 0.319413 82.7433 0.319413C83.4024 0.305518 84.0613 0.357297 84.7099 0.473992C85.1615 0.560655 85.607 0.67538 86.0442 0.8175L87.3268 1.33277V5.91864C82.9656 3.66864 78.4842 5.16291 78.6382 8.85567C78.6382 10.1438 78.9974 11.1228 79.7671 11.8442C80.5087 12.5508 81.4988 12.9338 82.5209 12.9091C83.359 12.9091 84.009 12.7374 84.4537 12.4453V7.43008H89.4651V14.7641C88.8327 15.451 87.8747 16.0522 86.609 16.5331C85.3035 17.0291 83.9166 17.2738 82.5209 17.2545C79.978 17.2545 77.84 16.4644 76.1067 14.8843Z" fill="white"></path><path d="M91.2845 0.597231H96.2883V10.1926C96.2883 11.9325 97.3503 12.7077 98.7209 12.7077C100.092 12.7077 101.137 11.9325 101.137 10.1926V0.597231H106.123V10.1581C106.123 12.4321 105.438 14.1892 104.016 15.4123C102.593 16.6355 100.863 17.2556 98.7209 17.2556C96.5792 17.2556 94.8146 16.6527 93.4093 15.4123C92.0049 14.172 91.2845 12.4321 91.2845 10.1581V0.597231Z" fill="white"></path><path d="M124.322 16.9756H118.438L114.091 11.1361H113.401V16.9756H108.363V0.597231H116.265C118.111 0.597231 119.612 1.08098 120.733 2.08304C121.279 2.54805 121.713 3.129 122.006 3.78355C122.298 4.4381 122.441 5.14976 122.424 5.86665C122.424 7.9226 121.302 9.63296 119.422 10.5659L124.322 16.9756ZM115.679 7.45612C116.627 7.45612 117.248 6.93781 117.248 6.1258C117.248 5.3138 116.627 4.81277 115.679 4.81277H113.401V7.45612H115.679Z" fill="white"></path><path d="M125.162 0.597231H130.165V10.1926C130.165 11.9325 131.228 12.7077 132.598 12.7077C133.969 12.7077 135.014 11.9325 135.014 10.1926V0.597231H140V10.1581C140 12.4321 139.315 14.1892 137.893 15.4123C136.471 16.6355 134.74 17.2556 132.598 17.2556C130.457 17.2556 128.691 16.6527 127.269 15.4123C125.847 14.172 125.162 12.4321 125.162 10.1581V0.597231Z" fill="white"></path><path d="M69.2656 6.80422C69.5512 7.07647 69.777 7.40493 69.9287 7.76878C70.0804 8.13264 70.1545 8.52395 70.1466 8.91788C70.1466 9.71385 69.8313 10.4777 69.2693 11.043C68.7074 11.6082 67.9443 11.9293 67.1462 11.9362C66.335 11.9362 65.6285 11.6404 65.0092 11.0489C64.7252 10.7718 64.5006 10.4401 64.3492 10.0737C64.1978 9.70734 64.1226 9.31409 64.1283 8.91788C64.1203 8.52395 64.1945 8.13264 64.3462 7.76878C64.4978 7.40493 64.7236 7.07647 65.0092 6.80422C65.286 6.51899 65.6183 6.29316 65.9858 6.14058C66.3532 5.98802 66.7481 5.91194 67.1462 5.917C67.5414 5.91329 67.9332 5.99006 68.2976 6.14262C68.6621 6.29518 68.9914 6.52031 69.2656 6.80422Z" fill="#20AEE3"></path><path d="M34.5179 17.246C32.3186 16.9899 30.5337 16.0509 29.121 14.4374C27.7084 12.8239 27.0316 10.9542 27.0316 8.82853C27.0316 6.47236 27.8437 4.48324 29.4933 2.81854C31.1427 1.15383 33.2237 0.317207 35.7191 0.317207C38.2145 0.317207 40.287 1.16237 41.928 2.81854C43.5691 4.4747 44.3896 6.47236 44.3896 8.82853C44.4035 10.422 43.9658 11.9863 43.1281 13.337C42.2903 14.6876 41.0873 15.7685 39.661 16.4521C40.1262 17.0326 40.7692 17.3143 41.6319 17.3143C42.3027 17.3203 42.9638 17.1528 43.5522 16.8277V20.9169C42.6872 21.2822 41.7575 21.4653 40.8199 21.4547C38.6628 21.4547 36.9034 20.5156 35.533 18.6717L34.5179 17.246ZM35.7191 12.7555C36.768 12.7555 37.6224 12.38 38.2906 11.6628C38.9589 10.9457 39.3142 9.97251 39.3142 8.82853C39.3142 7.6846 38.9674 6.74554 38.2906 6.02844C37.6139 5.31133 36.768 4.90155 35.7191 4.90155C34.6702 4.90155 33.8243 5.27718 33.1475 6.02844C32.4708 6.77969 32.1325 7.6846 32.1325 8.82853C32.1325 9.97251 32.4793 10.9115 33.1475 11.6628C33.8158 12.4141 34.6786 12.7555 35.7191 12.7555Z" fill="white"></path><path d="M44.8096 16.9756L51.5074 0.597231H56.2843L63.0078 16.9756H57.6359L56.4714 13.9259H51.159L49.9775 16.9756H44.8096ZM52.604 10.1796H55.0009L53.811 6.31438L52.604 10.1796Z" fill="white"></path><path d="M32.4379 21.3152H14.9675V25.6828H32.4379V21.3152Z" fill="#20AEE3"></path><path d="M15.4209 8.37699V13.7592L0 19.3531V14.2128L9.16186 11.0681L0 7.92343V2.78313L15.4209 8.37699Z" fill="#20AEE3"></path></svg>`;

/* Same nav-tools block as one-page-form/partials/demo-header.html */
const HEADER_NAV_ACTIONS = `
          <div class="nav-actions">
            <div class="nav-tool-dropdown">
              <button
                type="button"
                class="nav-tool-btn nav-tool-btn--lang"
                id="lang-toggle"

                aria-haspopup="menu"
                aria-expanded="false"
                aria-controls="lang-menu"
              >
                <span class="nav-tool-label" id="lang-label">Eng</span>
                <svg class="nav-tool-chevron" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
              </button>
              <ul class="nav-tool-menu" id="lang-menu" role="menu" aria-hidden="true">
                <li role="none"><a href="#" role="menuitem" data-lang="en">Eng</a></li>
                <li role="none"><a href="#" role="menuitem" data-lang="ru">Рус</a></li>
              </ul>
            </div>
            <button type="button" class="nav-tool-btn nav-tool-icon" id="theme-toggle" aria-label="Toggle theme">
              <svg class="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path id="theme-icon-path" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
            </button>
            <a href="https://github.com/aerokube/selenoid-ui" target="_blank" rel="noopener noreferrer" class="nav-icon" aria-label="GitHub проекта">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
              </svg>
            </a>
            <a href="https://aerokube.com/selenoid/" target="_blank" rel="noopener noreferrer" class="nav-icon" aria-label="Selenoid docs">
              <svg width="20" height="20" viewBox="0 0 514 495" fill="currentColor" aria-hidden="true">
                <g clip-path="url(#gh-io-clip)">
                  <path d="M487.2 270.5C487.2 394.488 408.7 495 251.7 495C116.893 495 25.2002 394.488 25.2002 270.5C25.2002 146.512 128.622 46 256.2 46C383.778 46 487.2 146.512 487.2 270.5Z" fill="var(--color-surface)"></path>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M256.135 -1C114.61 -1 0.200195 112.437 0.200195 252.775C0.200195 364.954 73.5064 459.912 175.202 493.52C187.916 496.047 192.573 488.06 192.573 481.341C192.573 475.458 192.154 455.292 192.154 434.28C120.959 449.409 106.133 404.029 106.133 404.029C94.692 374.617 77.7393 367.058 77.7393 367.058C54.4372 351.512 79.4367 351.512 79.4367 351.512C105.285 353.193 118.848 377.562 118.848 377.562C141.726 416.213 178.591 405.292 193.422 398.568C195.538 382.182 202.323 370.838 209.526 364.537C152.743 358.654 92.9999 336.807 92.9999 239.328C92.9999 211.597 103.163 188.91 119.267 171.265C116.726 164.964 107.826 138.91 121.813 104.038C121.813 104.038 143.423 97.3142 192.149 130.087C213.01 124.532 234.524 121.706 256.135 121.683C277.745 121.683 299.774 124.627 320.117 130.087C368.848 97.3142 390.458 104.038 390.458 104.038C404.445 138.91 395.539 164.964 392.998 171.265C409.527 188.91 419.271 211.597 419.271 239.328C419.271 336.807 359.528 358.231 302.32 364.537C311.645 372.519 319.692 387.642 319.692 411.593C319.692 445.624 319.273 472.937 319.273 481.336C319.273 488.06 323.936 496.047 336.645 493.526C438.34 459.907 511.646 364.954 511.646 252.775C512.065 112.437 397.237 -1 256.135 -1Z" fill="currentColor"></path>
                  <path d="M219.62 245.745C223.12 245.745 226.13 247.005 228.65 249.525C231.17 251.905 232.43 254.915 232.43 258.555C232.43 262.125 231.17 265.17 228.65 267.69C226.13 270.21 223.12 271.47 219.62 271.47C216.12 271.47 213.075 270.21 210.485 267.69C207.965 265.17 206.705 262.125 206.705 258.555C206.705 254.985 207.965 251.975 210.485 249.525C213.005 247.005 216.05 245.745 219.62 245.745ZM265.47 270H243.315V215.82H265.47V270ZM263.265 209.73C260.885 212.11 257.945 213.3 254.445 213.3C250.945 213.3 248.005 212.11 245.625 209.73C243.245 207.35 242.055 204.375 242.055 200.805C242.055 197.375 243.245 194.47 245.625 192.09C248.075 189.64 251.015 188.415 254.445 188.415C257.805 188.415 260.71 189.64 263.16 192.09C265.61 194.54 266.835 197.445 266.835 200.805C266.835 204.305 265.645 207.28 263.265 209.73ZM305.362 245.955C308.442 249.245 312.327 250.89 317.017 250.89C321.707 250.89 325.592 249.245 328.672 245.955C331.752 242.525 333.292 238.29 333.292 233.25C333.292 228.14 331.752 223.94 328.672 220.65C325.662 217.29 321.777 215.61 317.017 215.61C312.257 215.61 308.372 217.29 305.362 220.65C302.282 223.94 300.742 228.14 300.742 233.25C300.742 238.29 302.282 242.525 305.362 245.955ZM288.772 260.235C281.352 252.815 277.642 243.82 277.642 233.25C277.642 222.68 281.352 213.685 288.772 206.265C296.262 198.775 305.677 195.03 317.017 195.03C328.287 195.03 337.667 198.775 345.157 206.265C352.577 213.685 356.287 222.68 356.287 233.25C356.287 243.89 352.577 252.92 345.157 260.34C337.737 267.76 328.357 271.47 317.017 271.47C305.677 271.47 296.262 267.725 288.772 260.235Z" fill="currentColor"></path>
                  <path d="M254.7 280C256.7 280 257.187 276.41 259.2 274.5C261.387 272.425 264.2 272 265.474 270C266.747 268 242.2 268 243.317 270C244.434 272 247.836 272.327 250.2 274.5C252.243 276.378 252.7 280 254.7 280Z" fill="currentColor"></path>
                </g>
                <defs><clipPath id="gh-io-clip"><rect width="513.4" height="495" fill="white"></rect></clipPath></defs>
              </svg>
            </a>
          </div>`;

const HEADER_NAV_DRAWER = `
        <nav class="nav" aria-label="Navigation">
          <div class="nav-drawer-links">
            <a href="#/" class="nav-link form-nav-home active" aria-current="page">Selenoid 2.0</a>
          </div>
        </nav>`;

const STATUS_LABELS = {
  ok: "CONNECTED",
  error: "ISSUE",
  stale: "STALE",
  unknown: "UNKNOWN",
};

const STATUS_LABELS_COMPACT = {
  ok: "OK",
  error: "ERR",
  stale: "STALE",
  unknown: "?",
};

export function mountHeader(root, { onFilterChange, onFilterClear } = {}) {
  if (!root) {
    return { els: {}, update: () => {}, setFilterVisible: () => {}, clearFilter: () => {} };
  }

  root.innerHTML = `
    <div class="header-content">
      <div class="header-left">
        <div class="brand">
          <a href="https://qa.guru" class="logo" aria-label="QA.GURU" target="_blank" rel="noopener noreferrer">
            ${QA_GURU_LOGO_SVG}
          </a>
        </div>
        <nav class="form-nav" aria-label="Selenoid">
          <span class="brand-separator" aria-hidden="true">|</span>
          <a href="#/" class="nav-link form-nav-home active" aria-current="page">Selenoid 2.0</a>
        </nav>
      </div>

      <div class="app-header-metrics">
        <div class="header-metric header-metric--status" data-kind="sse">
          <span class="header-metric-label">sse</span>
          <span class="header-metric-value">
            <span class="header-metric-value-full" id="sse-status">UNKNOWN</span>
            <span class="header-metric-value-compact" aria-hidden="true">?</span>
          </span>
        </div>
        <span class="header-sep" aria-hidden="true"></span>
        <div class="header-metric header-metric--status" data-kind="selenoid">
          <span class="header-metric-label">selenoid</span>
          <span class="header-metric-value">
            <span class="header-metric-value-full" id="selenoid-status">UNKNOWN</span>
            <span class="header-metric-value-compact" aria-hidden="true">?</span>
          </span>
        </div>
        <span class="header-sep" aria-hidden="true"></span>
        <div class="header-metric">
          <span class="header-metric-label">used</span>
          <span class="header-metric-value header-metric-value--lg" id="used-value">—</span>
        </div>
        <span class="header-sep" aria-hidden="true"></span>
        <div class="header-metric">
          <span class="header-metric-label">queue</span>
          <span class="header-metric-value header-metric-value--lg" id="queue-value">—</span>
        </div>
        <span class="header-sep" aria-hidden="true"></span>
        <div class="header-metric">
          <span class="header-metric-label">quota</span>
          <span class="header-metric-value header-metric-value--lg" id="quota-value">—</span>
        </div>
      </div>

      <label class="app-header-filter">
        <span class="visually-hidden">Filter sessions</span>
        <input id="session-filter" type="search" placeholder="Filter..." autocomplete="off" />
        <button type="button" class="app-header-filter-clear" id="filter-clear" aria-label="Clear filter" hidden>×</button>
      </label>

      <div class="header-right">
        ${HEADER_NAV_ACTIONS}
      </div>

      ${HEADER_NAV_DRAWER}

      <button class="burger-menu" type="button" aria-label="Menu" aria-expanded="false">
        <div class="burger-line burger-line-1"></div>
        <div class="burger-line burger-line-2"></div>
        <div class="burger-line burger-line-3"></div>
      </button>

      <div class="nav-overlay"></div>
    </div>
  `;

  const els = {
    root,
    filterField: root.querySelector(".app-header-filter"),
    filterInput: root.querySelector("#session-filter"),
    filterClear: root.querySelector("#filter-clear"),
    sseStatus: root.querySelector("#sse-status"),
    sseStatusCompact: root.querySelector("#sse-status + .header-metric-value-compact"),
    selenoidStatus: root.querySelector("#selenoid-status"),
    selenoidStatusCompact: root.querySelector("#selenoid-status + .header-metric-value-compact"),
    usedValue: root.querySelector("#used-value"),
    queueValue: root.querySelector("#queue-value"),
    quotaValue: root.querySelector("#quota-value"),
  };

  els.filterInput?.addEventListener("input", () => {
    const query = els.filterInput.value.trim();
    els.filterClear.hidden = !query;
    onFilterChange?.(query);
  });

  els.filterClear?.addEventListener("click", () => {
    els.filterInput.value = "";
    els.filterClear.hidden = true;
    onFilterClear?.();
  });

  initHeaderShell(root);

  return {
    els,
    update: (metrics) => updateHeader(els, metrics),
    setFilterVisible: (visible) => setHeaderFilterVisible(els, visible),
    clearFilter: () => {
      if (!els.filterInput) return;
      els.filterInput.value = "";
      if (els.filterClear) els.filterClear.hidden = true;
    },
  };
}

export function updateHeader(els, { sse = "unknown", selenoid = "unknown", state = {} } = {}) {
  if (!els?.sseStatus) return;

  setMetricState(els.sseStatus.closest(".header-metric--status"), sse);
  setMetricState(els.selenoidStatus.closest(".header-metric--status"), selenoid);

  setStatusText(els.sseStatus, els.sseStatusCompact, sse);
  setStatusText(els.selenoidStatus, els.selenoidStatusCompact, selenoid);

  const total = state.total ?? 0;
  const used = state.used ?? 0;
  const pending = state.pending ?? 0;
  const queued = state.queued ?? 0;

  els.usedValue.textContent =
    total > 0 ? `${Math.round(((used + pending) / total) * 100)}%` : "—";
  els.queueValue.textContent = String(queued);
  els.quotaValue.textContent = total > 0 ? `${used + pending}/${total}` : "—";
}

export function setHeaderFilterVisible(els, visible) {
  if (!els?.filterField) return;
  els.filterField.hidden = !visible;
}

function setStatusText(fullEl, compactEl, state) {
  if (!fullEl || !compactEl) return;
  fullEl.textContent = STATUS_LABELS[state] || STATUS_LABELS.unknown;
  compactEl.textContent = STATUS_LABELS_COMPACT[state] || STATUS_LABELS_COMPACT.unknown;
}

function setMetricState(node, state) {
  if (!node) return;
  node.dataset.state = state;
}

function initHeaderShell(root) {
  const langToggle = root.querySelector("#lang-toggle");
  const langMenu = root.querySelector("#lang-menu");
  const themeToggle = root.querySelector("#theme-toggle");
  const burger = root.querySelector(".burger-menu");
  const nav = root.querySelector(".nav");
  const overlay = root.querySelector(".nav-overlay");

  function closeLangMenu() {
    if (!langToggle || !langMenu) return;
    langMenu.classList.remove("is-open");
    langMenu.setAttribute("aria-hidden", "true");
    langToggle.setAttribute("aria-expanded", "false");
  }

  langToggle?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const isOpen = !langMenu.classList.contains("is-open");
    langMenu.classList.toggle("is-open", isOpen);
    langMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
    langToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  document.addEventListener("click", (event) => {
    if (!langToggle?.contains(event.target) && !langMenu?.contains(event.target)) {
      closeLangMenu();
    }
  });

  themeToggle?.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("site-theme", next);
    updateThemeIcon(themeToggle, next === "dark");
  });

  const storedTheme = localStorage.getItem("site-theme") === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", storedTheme);
  updateThemeIcon(themeToggle, storedTheme === "dark");

  function closeMenu() {
    burger?.classList.remove("active");
    nav?.classList.remove("active");
    overlay?.classList.remove("active");
    burger?.setAttribute("aria-expanded", "false");
    closeLangMenu();
  }

  burger?.addEventListener("click", () => {
    const isOpen = !burger.classList.contains("active");
    burger.classList.toggle("active", isOpen);
    nav?.classList.toggle("active", isOpen);
    overlay?.classList.toggle("active", isOpen);
    burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  overlay?.addEventListener("click", closeMenu);
  root.querySelectorAll(".nav-link").forEach((link) => link.addEventListener("click", closeMenu));
  window.matchMedia(`(max-width: ${RESPONSIVE_BREAKPOINT_PX}px)`).addEventListener("change", closeMenu);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

function updateThemeIcon(toggle, isDark) {
  const icon = toggle?.querySelector(".theme-icon");
  if (!icon) return;
  icon.innerHTML = isDark
    ? '<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.6"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path>'
    : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>';
  toggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
}
