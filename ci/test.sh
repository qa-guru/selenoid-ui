#!/bin/bash

set -euo pipefail

export GOTOOLCHAIN=go1.26.0+auto
export GO111MODULE="on"

if [ "$(node -p "parseInt(process.version.slice(1))")" -ge 17 ]; then
  export NODE_OPTIONS="${NODE_OPTIONS:---openssl-legacy-provider}"
fi

test -f ui/package.json
yarn --cwd ui install --frozen-lockfile 2>/dev/null || yarn --cwd ui install
yarn --cwd ui test --watchAll=false --testPathPattern='uiFeed|Capabilities|App'
CI=false yarn --cwd ui build
test -f ui/build/index.html

go install github.com/rakyll/statik@latest
export PATH="$(go env GOPATH)/bin:$PATH"
go generate github.com/aerokube/selenoid-ui
go test -race -v -coverprofile=coverage.txt -covermode=atomic github.com/aerokube/selenoid-ui github.com/aerokube/selenoid-ui/selenoid

go install golang.org/x/vuln/cmd/govulncheck@v1.5.0
"$(go env GOPATH)/bin/govulncheck" ./...
