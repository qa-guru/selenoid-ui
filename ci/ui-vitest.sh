#!/bin/bash
# RTL + Allure, then a separate v8 coverage pass (same process OOMs).
set -euo pipefail

export NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--max-old-space-size=8192"
yarn --cwd ui typecheck
yarn --cwd ui test --maxWorkers=1 --fileParallelism=false
test -d ui/allure-results
ALLURE_SKIP=1 yarn --cwd ui test:coverage
test -f ui/coverage/lcov.info
