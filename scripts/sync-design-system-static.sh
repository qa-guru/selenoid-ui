#!/usr/bin/env bash
# Copy minimal design-system embed into ui/public/ for AppHeader (v3).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UI_PUBLIC="$ROOT/ui/public"
MONOREPO_ROOT="$(cd "$ROOT/../../.." && pwd)"
DS="$MONOREPO_ROOT/projects/design-system-home/design-system"

if [[ ! -d "$DS/css" ]]; then
  echo "sync-design-system-static: design-system not found at $DS — skip" >&2
  exit 0
fi

mkdir -p "$UI_PUBLIC/css" "$UI_PUBLIC/js" "$UI_PUBLIC/templates"

for f in tokens header link input icon icon-btn lang-toggle button badge; do
  cp "$DS/css/${f}.css" "$UI_PUBLIC/css/"
done

for f in header dom-utils theme-icons; do
  cp "$DS/js/${f}.js" "$UI_PUBLIC/js/"
done

cp "$DS/templates/header.html" "$UI_PUBLIC/templates/"

echo "sync-design-system-static: design-system → $UI_PUBLIC"
