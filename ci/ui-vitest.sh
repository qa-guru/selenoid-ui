#!/bin/bash
# RTL + v8 coverage + Allure-lite results (allure-vitest OOMs GHA: invalid table size).
set -euo pipefail

export NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--max-old-space-size=8192"
yarn --cwd ui typecheck
yarn --cwd ui test:coverage
test -d ui/allure-results
test -f ui/coverage/lcov.info
