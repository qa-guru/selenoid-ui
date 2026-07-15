#!/bin/bash

set -euo pipefail

export GOTOOLCHAIN=go1.26.5+auto
export GO111MODULE="on"

test -f ui/package.json
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
"$ROOT/scripts/sync-design-system-static.sh"
yarn --cwd ui install --frozen-lockfile 2>/dev/null || yarn --cwd ui install
yarn --cwd ui test
test -d ui/allure-results
yarn --cwd ui build
test -f ui/build/index.html

go install github.com/rakyll/statik@latest
export PATH="$(go env GOPATH)/bin:$PATH"
go generate github.com/aerokube/selenoid-ui
go test -race -v -coverprofile=coverage.txt -covermode=atomic github.com/aerokube/selenoid-ui github.com/aerokube/selenoid-ui/selenoid

GOTOOLCHAIN=go1.26.5 go run golang.org/x/vuln/cmd/govulncheck@v1.5.0 ./...
