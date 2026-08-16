#!/usr/bin/env node
'use strict'

/** Copy packages/postal-shared/src into a scope package's src/shared. */

const path = require('path')
const { syncSharedInto } = require('./compile-postal')

const scope = process.argv[2]
if (scope !== 'us' && scope !== 'world') {
  console.error('Usage: node scripts/sync-postal-shared.js <us|world>')
  process.exit(1)
}

const ROOT = path.join(__dirname, '..')
const pkg = path.join(ROOT, 'packages', `postal-${scope}`)
syncSharedInto(pkg)
console.log(`Synced postal-shared into postal-${scope}`)
