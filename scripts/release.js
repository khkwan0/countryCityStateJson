#!/usr/bin/env node
'use strict'

/**
 * Date version: YY.MM.DDnn
 *   YY/MM/DD = local calendar date
 *   nn       = 01, 02, … same-day publish counter (from npm registry + local version)
 *
 * Usage: npm run release
 *   1. bump package.json / package-lock.json
 *   2. commit
 *   3. git push (current branch)
 *   4. npm publish
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const pkg = require(path.join(ROOT, 'package.json'))

function run(cmd, opts = {}) {
  return execSync(cmd, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: 'pipe',
    ...opts,
  })
}

function datePrefix(date = new Date()) {
  const yy = String(date.getFullYear()).slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yy}.${mm}.${dd}`
}

/** Parse YY.MM.DDnn, including npm-stripped forms like 26.8.1601 or 26.4.501. */
function parseDateVersion(version) {
  const m = String(version).match(/^(\d+)\.(\d+)\.(\d+)$/)
  if (!m) return null
  const patch = m[3]
  if (patch.length < 3) return null
  const nn = patch.slice(-2)
  const dd = patch.slice(0, -2).padStart(2, '0')
  const yy = m[1].padStart(2, '0').slice(-2)
  const mm = m[2].padStart(2, '0')
  return {
    yy,
    mm,
    dd,
    nn,
    prefix: `${yy}.${mm}.${dd}`,
    canonical: `${yy}.${mm}.${dd}${nn}`,
  }
}

function nextDateVersion(prefix, versions) {
  let n = 1
  for (const v of versions) {
    const parsed = parseDateVersion(v)
    if (parsed && parsed.prefix === prefix) {
      n = Math.max(n, Number(parsed.nn) + 1)
    }
  }
  if (n > 99) {
    throw new Error(`Too many publishes for ${prefix} (max 99)`)
  }
  return `${prefix}${String(n).padStart(2, '0')}`
}

function chooseVersion(prefix, published, currentVersion) {
  const fromRegistry = nextDateVersion(prefix, published)
  const current = parseDateVersion(currentVersion)
  if (!current || current.prefix !== prefix) return fromRegistry
  const nextN = Number(fromRegistry.slice(-2))
  const curN = Number(current.nn)
  return curN >= nextN ? current.canonical : fromRegistry
}

function setRootVersion(next) {
  const pkgPath = path.join(ROOT, 'package.json')
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  pkgJson.version = next
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkgJson, null, 2)}\n`)

  const lockPath = path.join(ROOT, 'package-lock.json')
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'))
  lock.version = next
  if (lock.packages && lock.packages['']) lock.packages[''].version = next
  fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`)
}

function publishedVersions(name) {
  try {
    const raw = run(`npm view ${name} versions --json`)
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch (err) {
    const msg = `${err.stdout || ''}${err.stderr || ''}${err.message || ''}`
    if (/E404|404 Not Found|not in this registry/i.test(msg)) return []
    throw err
  }
}

function assertCleanTree() {
  const status = run('git status --porcelain').trim()
  if (status) {
    throw new Error(`Working tree is dirty. Commit or stash first.\n${status}`)
  }
}

function currentBranch() {
  return run('git rev-parse --abbrev-ref HEAD').trim()
}

function release() {
  assertCleanTree()

  const branch = currentBranch()
  if (branch === 'HEAD') {
    throw new Error('Detached HEAD — check out a branch before releasing')
  }

  try {
    run('npm whoami', { stdio: 'pipe' })
  } catch {
    throw new Error('Not logged in to npm. Run npm login first.')
  }

  const prefix = datePrefix()
  const next = chooseVersion(prefix, publishedVersions(pkg.name), pkg.version)
  const currentCanon = parseDateVersion(pkg.version)?.canonical
  console.log(`Releasing ${pkg.name}@${next} from ${branch}`)

  if (currentCanon !== next) {
    setRootVersion(next)
    run('git add package.json package-lock.json')
    run(`git commit -m "release: ${next}"`, { stdio: 'inherit' })
  } else {
    console.log(`package.json already at ${pkg.version} (same as ${next}); skipping version commit`)
  }

  run('git push', { stdio: 'inherit' })
  run('npm publish', { stdio: 'inherit' })
  console.log(`Published ${pkg.name}@${next}`)
}

if (require.main === module) {
  try {
    release()
  } catch (err) {
    const detail = err.stderr || err.stdout || err.message || err
    console.error(String(detail).trim() || err)
    process.exit(1)
  }
}

module.exports = {
  chooseVersion,
  datePrefix,
  nextDateVersion,
  parseDateVersion,
  publishedVersions,
  release,
}
