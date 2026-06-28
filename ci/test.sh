#!/bin/bash

set -euo pipefail

export GO111MODULE="on"
test -f ui-v2/index.html
go install github.com/rakyll/statik@latest
go generate github.com/aerokube/selenoid-ui
go test -race -v -coverprofile=coverage.txt -covermode=atomic ./...

go install golang.org/x/vuln/cmd/govulncheck@latest
if ! "$(go env GOPATH)"/bin/govulncheck ./...; then
	echo "::warning::govulncheck reported vulnerabilities (non-blocking for release)"
fi
