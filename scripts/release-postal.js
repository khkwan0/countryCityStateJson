#!/usr/bin/env node
'use strict'

/**
 * Release a postal scope package (manual 2FA publish).
 * Usage: node scripts/release-postal.js us|world
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const {
  chooseVersion,
  datePrefix,
  parseDateVersion,
  publishedVersions,
} = require('./release')

const ROOT = path.join(__dirname, '..')
const scope = process.argv[2]
if (scope !== 'us' && scope !== 'world') {
  console.error('Usage: node scripts/release-postal.js <us|world>')
  process.exit(1)
}

const pkgDir = path.join(ROOT, 'packages', `postal-${scope}`)
const pkgPath = path.join(pkgDir, 'package.json')

function run(cmd, opts = {}) {
  return execSync(cmd, {
    cwd: opts.cwd || ROOT,
    encoding: 'utf8',
    stdio: opts.stdio || 'pipe',
    ...opts,
  })
}

function assertCleanTree() {
  const status = run('git status --porcelain').trim()
  if (status) {
    throw new Error(`Working tree is dirty. Commit or stash first.\n${status}`)
  }
}

function setPkgVersion(next) {
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  pkgJson.version = next
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkgJson, null, 2)}\n`)
}

function releasePostal() {
  assertCleanTree()

  try {
    run('npm whoami')
  } catch {
    throw new Error('Not logged in to npm. Run npm login first.')
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  const prefix = datePrefix()
  const next = chooseVersion(prefix, publishedVersions(pkg.name), pkg.version)
  const currentCanon = parseDateVersion(pkg.version)?.canonical

  console.log(`Releasing ${pkg.name}@${next}`)

  run(`npm run build --workspace=${pkg.name}`, { stdio: 'inherit' })

  if (currentCanon !== next) {
    setPkgVersion(next)
    run(`git add ${path.relative(ROOT, pkgPath)}`)
    run(`git commit -m "release(${scope}): ${pkg.name}@${next}"`, {
      stdio: 'inherit',
    })
  } else {
    console.log(`Already at ${pkg.version}; skipping version commit`)
  }

  run('git push', { stdio: 'inherit' })
  run('npm publish', { cwd: pkgDir, stdio: 'inherit' })
  console.log(`Published ${pkg.name}@${next}`)
}

if (require.main === module) {
  try {
    releasePostal()
  } catch (err) {
    console.error(String(err.stderr || err.stdout || err.message || err).trim())
    process.exit(1)
  }
}

module.exports = { releasePostal }
