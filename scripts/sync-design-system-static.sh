#!/usr/bin/env bash
# Copy design-system embed into ui/public/ for AppHeader (v3)
# and re-vendor @zero-design-system/react into ui/vendor/react-ui.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UI_PUBLIC="$ROOT/ui/public"
MONOREPO_ROOT="$(cd "$ROOT/../../.." && pwd)"
DS="$MONOREPO_ROOT/projects/design-system-home/design-system"
REACT_UI="$MONOREPO_ROOT/packages/react-ui"
VENDOR="$ROOT/ui/vendor/react-ui"

if [[ ! -d "$DS/css" ]]; then
  echo "sync-design-system-static: design-system not found at $DS — skip" >&2
  exit 0
fi

# SSOT → public: CSS + header runtime (lazy getMount lives in DS header.js).
# Consumer-only: selenoid-header-bridge.js (not synced).
mkdir -p "$UI_PUBLIC/css" "$UI_PUBLIC/js" "$UI_PUBLIC/templates"

for f in tokens header link input icon icon-btn lang-toggle button badge status-tile selenoid-metrics plaque-divider panel sticky tab; do
  cp "$DS/css/${f}.css" "$UI_PUBLIC/css/"
done

for f in header header-metrics-wrap dom-utils theme-icons plaque-field-magnet; do
  cp "$DS/js/${f}.js" "$UI_PUBLIC/js/"
done

cp "$DS/templates/header.html" "$UI_PUBLIC/templates/header.html"

# Wiring guard: metrics adaptive must stay hooked in the synced header.js.
# Prevents the CSS-without-observe drift that killed wrap on narrow viewports.
HEADER_JS="$UI_PUBLIC/js/header.js"
for needle in "header-metrics-wrap.js" "observeHeaderMetricsWrap" "getMount" "__designSystemRemountHeader"; do
  if ! grep -qF "$needle" "$HEADER_JS"; then
    echo "sync-design-system-static: ERROR — $HEADER_JS missing required wiring: $needle" >&2
    exit 1
  fi
done
if [[ ! -f "$UI_PUBLIC/js/header-metrics-wrap.js" ]]; then
  echo "sync-design-system-static: ERROR — header-metrics-wrap.js was not copied" >&2
  exit 1
fi

echo "sync-design-system-static: design-system → $UI_PUBLIC"

# Re-vendor @zero-design-system/react: build the library and copy its fresh dist
# into the consumer's file: dependency so the pinned vendor never drifts from source.
if [[ ! -d "$REACT_UI" ]]; then
  echo "sync-design-system-static: react-ui not found at $REACT_UI — skip vendor" >&2
  exit 0
fi

echo "sync-design-system-static: building @zero-design-system/react …"
( cd "$MONOREPO_ROOT" && npm run build -w @zero-design-system/react )

mkdir -p "$VENDOR/dist"
rm -f "$VENDOR/dist"/*
cp "$REACT_UI/dist/"* "$VENDOR/dist/"

# Vendor manifest: derive name/version/peerDeps from source, but pin the css subpath
# export to the real tsup artifact (dist/index.css) — the source package.json points
# ./styles.css at ./dist/styles.css, which tsup does not emit.
node -e '
  const fs = require("fs");
  const src = require(process.argv[1]);
  const manifest = {
    name: src.name,
    version: src.version,
    type: src.type,
    main: "./dist/index.js",
    module: "./dist/index.js",
    types: "./dist/index.d.ts",
    exports: {
      ".": { types: "./dist/index.d.ts", import: "./dist/index.js" },
      "./styles.css": "./dist/index.css",
    },
    files: ["dist"],
    peerDependencies: src.peerDependencies,
    sideEffects: ["**/*.css"],
  };
  fs.writeFileSync(process.argv[2], JSON.stringify(manifest, null, 4) + "\n");
' "$REACT_UI/package.json" "$VENDOR/package.json"

# Refresh yarn's file: copy under node_modules (yarn does not re-copy on
# "Already up-to-date" when only vendor/dist contents change).
NM_REACT="$ROOT/ui/node_modules/@zero-design-system/react"
if [[ -d "$NM_REACT" ]]; then
  mkdir -p "$NM_REACT/dist"
  rm -f "$NM_REACT/dist"/*
  cp "$VENDOR/dist/"* "$NM_REACT/dist/"
  cp "$VENDOR/package.json" "$NM_REACT/package.json"
  echo "sync-design-system-static: refreshed node_modules/@zero-design-system/react"
fi

echo "sync-design-system-static: react-ui → $VENDOR"
