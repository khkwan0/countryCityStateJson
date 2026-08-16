#!/usr/bin/env node
'use strict'

const path = require('path')
const fs = require('fs')

const ROOT = path.join(__dirname, '..')

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

async function smoke(scope) {
  const pkgDir = path.join(ROOT, 'packages', `postal-${scope}`)
  const cjs = require(path.join(pkgDir, 'dist/cjs/index.js'))
  assert(typeof cjs.getCitiesByPostalCode === 'function', `${scope} CJS API missing`)
  assert(typeof cjs.default?.getCitiesByPostalCode === 'function', `${scope} default missing`)

  if (scope === 'us') {
    const hits = await cjs.getCitiesByPostalCode('90210', 'US')
    assert(Array.isArray(hits), '90210 should return array')
    assert(hits.length >= 1, '90210 should have at least one hit')
    assert(
      hits.some((h) => /beverly hills/i.test(h.city)),
      `90210 expected Beverly Hills, got ${JSON.stringify(hits)}`
    )
  }

  console.log(`smoke postal-${scope}: ok`)
}

async function main() {
  for (const scope of ['us', 'world']) {
    const dist = path.join(ROOT, 'packages', `postal-${scope}`, 'dist/cjs/index.js')
    if (!fs.existsSync(dist)) {
      throw new Error(`Missing ${dist}; run npm run build:postal`)
    }
    await smoke(scope)
  }
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
