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

function nextDateVersion(prefix, versions) {
  let n = 1
  const re = new RegExp(`^${prefix.replace(/\./g, '\\.')}(\\d{2})$`)
  for (const v of versions) {
    const m = String(v).match(re)
    if (m) n = Math.max(n, Number(m[1]) + 1)
  }
  if (n > 99) {
    throw new Error(`Too many publishes for ${prefix} (max 99)`)
  }
  return `${prefix}${String(n).padStart(2, '0')}`
}

function chooseVersion(prefix, published, currentVersion) {
  const fromRegistry = nextDateVersion(prefix, published)
  if (!currentVersion || !String(currentVersion).startsWith(prefix)) {
    return fromRegistry
  }
  const curN = Number(String(currentVersion).slice(prefix.length))
  const nextN = Number(fromRegistry.slice(prefix.length))
  if (!Number.isFinite(curN)) return fromRegistry
  return curN >= nextN ? currentVersion : fromRegistry
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
  console.log(`Releasing ${pkg.name}@${next} from ${branch}`)

  if (pkg.version !== next) {
    run(`npm version ${next} --no-git-tag-version`, { stdio: 'inherit' })
    run('git add package.json package-lock.json')
    run(`git commit -m "release: ${next}"`, { stdio: 'inherit' })
  } else {
    console.log(`package.json already at ${next}; skipping version commit`)
  }

  run('git push', { stdio: 'inherit' })
  run('npm publish', { stdio: 'inherit' })
  console.log(`Published ${pkg.name}@${next}`)
}

if (require.main === module) {
  try {
    release()
  } catch (err) {
    console.error(err.message || err)
    process.exit(1)
  }
}

module.exports = {
  chooseVersion,
  datePrefix,
  nextDateVersion,
  publishedVersions,
  release,
}
