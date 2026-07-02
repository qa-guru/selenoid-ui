/**
 * Selenoid UI v3 — QA.GURU shell + live metrics bar.
 * Standalone preview: header-preview.html
 */

const QA_GURU_LOGO_SVG = `<svg class="default-logo" width="140" height="26" viewBox="0 0 140 26" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-hidden="true"><path d="M76.1067 14.8843C74.3621 13.3041 73.5068 11.2774 73.5068 8.78693C73.5068 6.2965 74.3962 4.25261 76.1238 2.68964C77.8514 1.12666 80.075 0.319413 82.7433 0.319413C83.4024 0.305518 84.0613 0.357297 84.7099 0.473992C85.1615 0.560655 85.607 0.67538 86.0442 0.8175L87.3268 1.33277V5.91864C82.9656 3.66864 78.4842 5.16291 78.6382 8.85567C78.6382 10.1438 78.9974 11.1228 79.7671 11.8442C80.5087 12.5508 81.4988 12.9338 82.5209 12.9091C83.359 12.9091 84.009 12.7374 84.4537 12.4453V7.43008H89.4651V14.7641C88.8327 15.451 87.8747 16.0522 86.609 16.5331C85.3035 17.0291 83.9166 17.2738 82.5209 17.2545C79.978 17.2545 77.84 16.4644 76.1067 14.8843Z" fill="white"></path><path d="M91.2845 0.597231H96.2883V10.1926C96.2883 11.9325 97.3503 12.7077 98.7209 12.7077C100.092 12.7077 101.137 11.9325 101.137 10.1926V0.597231H106.123V10.1581C106.123 12.4321 105.438 14.1892 104.016 15.4123C102.593 16.6355 100.863 17.2556 98.7209 17.2556C96.5792 17.2556 94.8146 16.6527 93.4093 15.4123C92.0049 14.172 91.2845 12.4321 91.2845 10.1581V0.597231Z" fill="white"></path><path d="M124.322 16.9756H118.438L114.091 11.1361H113.401V16.9756H108.363V0.597231H116.265C118.111 0.597231 119.612 1.08098 120.733 2.08304C121.279 2.54805 121.713 3.129 122.006 3.78355C122.298 4.4381 122.441 5.14976 122.424 5.86665C122.424 7.9226 121.302 9.63296 119.422 10.5659L124.322 16.9756ZM115.679 7.45612C116.627 7.45612 117.248 6.93781 117.248 6.1258C117.248 5.3138 116.627 4.81277 115.679 4.81277H113.401V7.45612H115.679Z" fill="white"></path><path d="M125.162 0.597231H130.165V10.1926C130.165 11.9325 131.228 12.7077 132.598 12.7077C133.969 12.7077 135.014 11.9325 135.014 10.1926V0.597231H140V10.1581C140 12.4321 139.315 14.1892 137.893 15.4123C136.471 16.6355 134.74 17.2556 132.598 17.2556C130.457 17.2556 128.691 16.6527 127.269 15.4123C125.847 14.172 125.162 12.4321 125.162 10.1581V0.597231Z" fill="white"></path><path d="M69.2656 6.80422C69.5512 7.07647 69.777 7.40493 69.9287 7.76878C70.0804 8.13264 70.1545 8.52395 70.1466 8.91788C70.1466 9.71385 69.8313 10.4777 69.2693 11.043C68.7074 11.6082 67.9443 11.9293 67.1462 11.9362C66.335 11.9362 65.6285 11.6404 65.0092 11.0489C64.7252 10.7718 64.5006 10.4401 64.3492 10.0737C64.1978 9.70734 64.1226 9.31409 64.1283 8.91788C64.1203 8.52395 64.1945 8.13264 64.3462 7.76878C64.4978 7.40493 64.7236 7.07647 65.0092 6.80422C65.286 6.51899 65.6183 6.29316 65.9858 6.14058C66.3532 5.98802 66.7481 5.91194 67.1462 5.917C67.5414 5.91329 67.9332 5.99006 68.2976 6.14262C68.6621 6.29518 68.9914 6.52031 69.2656 6.80422Z" fill="#20AEE3"></path><path d="M34.5179 17.246C32.3186 16.9899 30.5337 16.0509 29.121 14.4374C27.7084 12.8239 27.0316 10.9542 27.0316 8.82853C27.0316 6.47236 27.8437 4.48324 29.4933 2.81854C31.1427 1.15383 33.2237 0.317207 35.7191 0.317207C38.2145 0.317207 40.287 1.16237 41.928 2.81854C43.5691 4.4747 44.3896 6.47236 44.3896 8.82853C44.4035 10.422 43.9658 11.9863 43.1281 13.337C42.2903 14.6876 41.0873 15.7685 39.661 16.4521C40.1262 17.0326 40.7692 17.3143 41.6319 17.3143C42.3027 17.3203 42.9638 17.1528 43.5522 16.8277V20.9169C42.6872 21.2822 41.7575 21.4653 40.8199 21.4547C38.6628 21.4547 36.9034 20.5156 35.533 18.6717L34.5179 17.246ZM35.7191 12.7555C36.768 12.7555 37.6224 12.38 38.2906 11.6628C38.9589 10.9457 39.3142 9.97251 39.3142 8.82853C39.3142 7.6846 38.9674 6.74554 38.2906 6.02844C37.6139 5.31133 36.768 4.90155 35.7191 4.90155C34.6702 4.90155 33.8243 5.27718 33.1475 6.02844C32.4708 6.77969 32.1325 7.6846 32.1325 8.82853C32.1325 9.97251 32.4793 10.9115 33.1475 11.6628C33.8158 12.4141 34.6786 12.7555 35.7191 12.7555Z" fill="white"></path><path d="M44.8096 16.9756L51.5074 0.597231H56.2843L63.0078 16.9756H57.6359L56.4714 13.9259H51.159L49.9775 16.9756H44.8096ZM52.604 10.1796H55.0009L53.811 6.31438L52.604 10.1796Z" fill="white"></path><path d="M32.4379 21.3152H14.9675V25.6828H32.4379V21.3152Z" fill="#20AEE3"></path><path d="M15.4209 8.37699V13.7592L0 19.3531V14.2128L9.16186 11.0681L0 7.92343V2.78313L15.4209 8.37699Z" fill="#20AEE3"></path></svg>`;

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
          <a href="#/" class="nav-link selenoid-brand-link">Selenoid 2.0</a>
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
        <input
          id="session-filter"
          type="search"
          placeholder="Filter..."
          autocomplete="off"

        />
        <button
          type="button"
          class="app-header-filter-clear"
          id="filter-clear"
          aria-label="Clear filter"
          hidden
        >
          ×
        </button>
      </label>
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
