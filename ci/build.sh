#!/bin/bash

set -euo pipefail
set -x

export GO111MODULE="on"

yarn --cwd ui install --frozen-lockfile
NODE_OPTIONS=--openssl-legacy-provider yarn --cwd ui build
go install github.com/rakyll/statik@latest
go generate .

go install github.com/mitchellh/gox@latest
CGO_ENABLED=0 gox -os "linux darwin windows" -arch "amd64" -osarch="darwin/arm64" -osarch="windows/386" -output "dist/{{.Dir}}_{{.OS}}_{{.Arch}}" -ldflags "-X main.buildStamp=`date -u '+%Y-%m-%d_%I:%M:%S%p'` -X main.gitRevision=`git describe --tags || git rev-parse HEAD`"

LDFLAGS="-X main.buildStamp=`date -u '+%Y-%m-%d_%I:%M:%S%p'` -X main.gitRevision=`git describe --tags || git rev-parse HEAD`"
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o selenoid-ui -ldflags "$LDFLAGS"
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o health-check healthcheck/main.go

mkdir -p licenses
yarn --cwd ui licenses generate-disclaimer > licenses/ui-licenses
cd "$(go env GOPATH)/pkg/mod"
find . -name 'LICENSE*' -exec cp --parents {} "${GITHUB_WORKSPACE}/licenses" \; || true
cd "${GITHUB_WORKSPACE}"

test -f selenoid-ui
test -f health-check
