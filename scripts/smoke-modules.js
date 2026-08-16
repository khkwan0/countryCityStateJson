#!/usr/bin/env node
'use strict'

/**
 * Smoke-test published CJS `require` and ESM `import` entrypoints,
 * including package.json "exports" as a real consumer would resolve them.
 */

const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')

const ROOT = path.join(__dirname, '..')
const PKG = 'countrycitystatejson'

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: process.env,
  })
  if (result.status !== 0) {
    const output = `${result.stdout || ''}${result.stderr || ''}`
    throw new Error(
      `${command} ${args.join(' ')} failed (exit ${result.status}):\n${output}`
    )
  }
  return result.stdout.trim()
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const cjs = require(path.join(ROOT, 'dist/cjs/index.js'))
assert(typeof cjs.getAll === 'function', 'CJS named export getAll missing')
assert(typeof cjs.default?.getAll === 'function', 'CJS default.getAll missing')
assert(cjs.getCities('US', 'California').includes('Los Angeles'), 'CJS getCities failed')

const root = require(path.join(ROOT, 'index.js'))
assert(typeof root.getCountries === 'function', 'root index.js require failed')

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ccs-consumer-'))
const nm = path.join(tmp, 'node_modules')
fs.mkdirSync(nm)
fs.symlinkSync(ROOT, path.join(nm, PKG), 'dir')

const requireOut = run(
  process.execPath,
  [
    '-e',
    `
const geo = require('${PKG}')
const server = require('${PKG}/server')
const countries = require('${PKG}/countries')
const client = require('${PKG}/client')
if (typeof geo.getAll !== 'function') throw new Error('require default entry failed')
if (geo.getAll !== server.getAll) throw new Error('server entry mismatch')
if (!countries.getStatesByShort('US').includes('California')) throw new Error('countries require failed')
client.getCities('US', 'California').then((cities) => {
  if (!cities.includes('Los Angeles')) throw new Error('client require failed')
  console.log('require ok', geo.getCountries().length)
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
`,
  ],
  tmp
)

if (!requireOut.includes('require ok')) {
  throw new Error(`unexpected require smoke output: ${requireOut}`)
}

const importOut = run(
  process.execPath,
  [
    '--input-type=module',
    '-e',
    `
import geo, { getAll, getCities, getCountries } from '${PKG}'
import * as server from '${PKG}/server'
import * as countries from '${PKG}/countries'
import * as client from '${PKG}/client'

if (typeof getAll !== 'function' || typeof geo.getAll !== 'function') {
  throw new Error('ESM default/named import failed')
}
if (getAll !== server.getAll) throw new Error('ESM server entry mismatch')
if (!getCities('US', 'California').includes('Los Angeles')) throw new Error('ESM getCities failed')
if (!countries.getStatesByShort('US').includes('California')) throw new Error('ESM countries failed')
const lazy = await client.getCities('US', 'California')
if (!lazy.includes('Los Angeles')) throw new Error('ESM client failed')
console.log('import ok', getCountries().length)
`,
  ],
  tmp
)

if (!importOut.includes('import ok')) {
  throw new Error(`unexpected import smoke output: ${importOut}`)
}

fs.rmSync(tmp, { recursive: true, force: true })
console.log('smoke-modules ok')
console.log(requireOut)
console.log(importOut)
