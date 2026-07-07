#!/bin/bash

set -euo pipefail

export GO111MODULE="on"
export NODE_OPTIONS="${NODE_OPTIONS:---openssl-legacy-provider}"

test -f ui/package.json
yarn --cwd ui install --frozen-lockfile 2>/dev/null || yarn --cwd ui install
yarn --cwd ui test --watchAll=false --testPathPattern='uiFeed|Capabilities|App'
yarn --cwd ui build
test -f ui/build/index.html

go install github.com/rakyll/statik@latest
go generate github.com/aerokube/selenoid-ui
go test -race -v -coverprofile=coverage.txt -covermode=atomic ./...

go install golang.org/x/vuln/cmd/govulncheck@latest
if ! "$(go env GOPATH)"/bin/govulncheck ./...; then
	echo "::warning::govulncheck reported vulnerabilities (non-blocking for release)"
fi
