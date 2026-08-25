#!/bin/bash

set -euo pipefail
set -x

export GO111MODULE="on"

test -f ui/package.json
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
"$ROOT/scripts/sync-design-system-static.sh"
yarn --cwd ui install --frozen-lockfile 2>/dev/null || yarn --cwd ui install
CI=false yarn --cwd ui build
test -f ui/build/index.html

go install github.com/rakyll/statik@latest
go generate .

statik_size="$(wc -c < statik/statik.go | tr -d ' ')"
if [[ "$statik_size" -lt 100000 ]]; then
  echo "ERROR: statik/statik.go is only ${statik_size} bytes — React ui/build was not embedded" >&2
  echo "       Run: yarn --cwd ui build && go generate ." >&2
  exit 1
fi

GIT_REVISION="${GIT_REVISION:-$(git describe --tags --always --dirty 2>/dev/null || git rev-parse --short HEAD)}"
BUILD_STAMP="$(date -u '+%Y-%m-%d_%I:%M:%S%p')"
LDFLAGS="-X main.buildStamp=${BUILD_STAMP} -X main.gitRevision=${GIT_REVISION}"

go install github.com/mitchellh/gox@latest
CGO_ENABLED=0 gox -os "linux darwin windows" -arch "amd64" -osarch="darwin/arm64" -osarch="windows/386" -output "dist/{{.Dir}}_{{.OS}}_{{.Arch}}" -ldflags "$LDFLAGS"
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o selenoid-ui -ldflags "$LDFLAGS"
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o health-check healthcheck/main.go

mkdir -p licenses
echo "Selenoid UI — React frontend (ui/) + Go backend." > licenses/ui-licenses
cd "$(go env GOPATH)/pkg/mod"
find . -name 'LICENSE*' -exec cp --parents {} "${GITHUB_WORKSPACE}/licenses" \; || true
cd "${GITHUB_WORKSPACE}"

test -f selenoid-ui
test -f health-check
