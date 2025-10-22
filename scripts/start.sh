#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}/app"

echo "Starting Point3 Learning Tool..."
if command -v npx >/dev/null 2>&1; then
  echo "Ensuring ports 3000 and 5000 are free..."
  npx kill-port 3000 5000 >/dev/null 2>&1 || true
fi

npm run start -- "$@"
