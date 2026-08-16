#!/usr/bin/env node
'use strict'

/** Copy postal JSON data into dist/cjs and dist/esm for a scope package. */

const fs = require('fs')
const path = require('path')

const scope = process.argv[2]
if (scope !== 'us' && scope !== 'world') {
  console.error('Usage: node scripts/copy-postal-data.js <us|world>')
  process.exit(1)
}

const ROOT = path.join(__dirname, '..')
const pkg = path.join(ROOT, 'packages', `postal-${scope}`)
const srcLib = path.join(pkg, 'src/lib')

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true })
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name)
    const dest = path.join(to, entry.name)
    if (entry.isDirectory()) copyDir(src, dest)
    else fs.copyFileSync(src, dest)
  }
}

for (const out of ['dist/cjs/lib', 'dist/esm/lib']) {
  const dest = path.join(pkg, out)
  fs.rmSync(dest, { recursive: true, force: true })
  copyDir(srcLib, dest)
}

console.log(`Copied postal data for ${scope}`)
