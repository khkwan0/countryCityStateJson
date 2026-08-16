#!/usr/bin/env bash
# Portable CI entrypoint — usable from Jenkins, GitLab CI, CircleCI, etc.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

NODE_VERSION_HINT="${NODE_VERSION_HINT:-20}"

echo "==> Node $(node -v) / npm $(npm -v)"
echo "==> Expected Node ${NODE_VERSION_HINT}+ (18+ should work)"

if [[ -f package-lock.json ]]; then
  echo "==> npm ci"
  npm ci
else
  echo "==> npm install (no package-lock.json)"
  npm install
fi

echo "==> build (split client chunks + CJS/ESM)"
npm run build

echo "==> test"
npm test

echo "==> smoke: require + import (including package exports)"
node scripts/smoke-modules.js

if [[ -f packages/postal-us/src/lib/DATA_HASH ]]; then
  echo "==> build postal packages"
  npm run build:postal
  echo "==> test postal"
  npm run test:postal
  echo "==> smoke postal"
  npm run smoke:postal
else
  echo "==> skip postal (no compiled DATA_HASH yet; run npm run compile:postal)"
fi

echo "==> CI passed"
