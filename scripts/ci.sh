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

echo "==> smoke: server + client entries"
node -e "
const server = require('./dist/cjs/server');
const client = require('./dist/cjs/client');
if (!server.getCities('US', 'California').includes('Los Angeles')) {
  throw new Error('server smoke failed');
}
client.getCities('US', 'California').then((cities) => {
  if (!cities.includes('Los Angeles')) throw new Error('client smoke failed');
  console.log('smoke ok');
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
"

echo "==> CI passed"
