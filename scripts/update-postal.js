#!/usr/bin/env node
'use strict'

/**
 * Monthly (or manual) postal refresh:
 *   1. compile-postal (download + bridge)
 *   2. compare DATA_HASH / git diff
 *   3. on change: commit branch chore/postal-update + open/update GitHub PR
 * Never runs npm publish (manual 2FA release after merge).
 *
 * Env:
 *   POSTAL_UPDATE_DRY_RUN=1  — compile + report only (no git/gh)
 *   POSTAL_UPDATE_SKIP_DOWNLOAD=1 — use .cache/geonames zips
 */

const fs = require('fs')
const path = require('path')
const { execSync, spawnSync } = require('child_process')
const { compile } = require('./compile-postal')

const ROOT = path.join(__dirname, '..')
const BRANCH = 'chore/postal-update'
const SCOPES = ['us', 'world']

function run(cmd, opts = {}) {
  return execSync(cmd, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: 'pipe',
    ...opts,
  })
}

function runInherit(cmd) {
  const result = spawnSync(cmd, {
    cwd: ROOT,
    shell: true,
    stdio: 'inherit',
    env: process.env,
  })
  if (result.status !== 0) {
    throw new Error(`Command failed (${result.status}): ${cmd}`)
  }
}

function readHash(scope) {
  const p = path.join(ROOT, 'packages', `postal-${scope}`, 'src/lib/DATA_HASH')
  if (!fs.existsSync(p)) return null
  return fs.readFileSync(p, 'utf8').trim()
}

function snapshotHashes() {
  const out = {}
  for (const scope of SCOPES) out[scope] = readHash(scope)
  return out
}

function changedScopes(before, after) {
  return SCOPES.filter((s) => before[s] !== after[s])
}

function defaultBranch() {
  try {
    const ref = run('git symbolic-ref refs/remotes/origin/HEAD').trim()
    return ref.replace('refs/remotes/origin/', '')
  } catch {
    return 'master'
  }
}

function prBody(changed) {
  const lines = [
    '## Postal data refresh (GeoNames)',
    '',
    'Automated monthly bridge update. **Do not merge blindly without a quick glance at the diff size.**',
    '',
    '### Scopes changed',
    ...changed.map((s) => `- \`countrycitystatejson-postal-${s}\``),
    '',
    '### After merge — release manually (2FA)',
    '',
    '```bash',
    ...changed.map((s) => `npm run release:postal-${s}`),
    '```',
    '',
    'Postal source: [GeoNames postal codes](https://www.geonames.org/) (CC BY).',
  ]
  return lines.join('\n')
}

async function main() {
  const dryRun = process.env.POSTAL_UPDATE_DRY_RUN === '1'
  const skipDownload = process.env.POSTAL_UPDATE_SKIP_DOWNLOAD === '1'

  const before = snapshotHashes()
  console.log('Compiling postal indexes…')
  await compile({ scope: 'all', skipDownload })

  const after = snapshotHashes()
  const changed = changedScopes(before, after)

  if (!changed.length) {
    console.log('No postal data changes; skipping PR.')
    return
  }

  console.log(`Changed scopes: ${changed.join(', ')}`)

  // Ensure shared sources + package indexes are in sync (compile already did this)
  runInherit('npm run build:postal')
  runInherit('npm run test:postal')

  if (dryRun) {
    console.log('DRY RUN — would open PR for:', changed.join(', '))
    console.log(prBody(changed))
    return
  }

  const base = defaultBranch()
  run(`git checkout -B ${BRANCH}`)
  run(
    'git add packages/postal-us packages/postal-world packages/postal-shared'
  )
  const status = run('git status --porcelain').trim()
  if (!status) {
    console.log('Working tree clean after compile; nothing to commit.')
    return
  }

  run(`git commit -m "chore(postal): refresh GeoNames bridge (${changed.join(', ')})"`)

  runInherit(`git push -u origin HEAD:${BRANCH} --force-with-lease`)

  const existing = spawnSync(
    'gh',
    ['pr', 'list', '--head', BRANCH, '--json', 'number', '--jq', '.[0].number'],
    { cwd: ROOT, encoding: 'utf8' }
  )
  const prNumber = (existing.stdout || '').trim()
  const title = `chore(postal): refresh GeoNames (${changed.join(', ')})`
  const body = prBody(changed)

  if (prNumber) {
    const edit = spawnSync(
      'gh',
      ['pr', 'edit', prNumber, '--title', title, '--body', body],
      { cwd: ROOT, encoding: 'utf8', stdio: 'inherit' }
    )
    if (edit.status !== 0) throw new Error(`gh pr edit failed`)
    console.log(`Updated PR #${prNumber}`)
  } else {
    const create = spawnSync(
      'gh',
      ['pr', 'create', '--base', base, '--head', BRANCH, '--title', title, '--body', body],
      { cwd: ROOT, encoding: 'utf8', stdio: 'inherit' }
    )
    if (create.status !== 0) throw new Error(`gh pr create failed`)
    console.log('Opened postal update PR')
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(String(err.stderr || err.stdout || err.message || err).trim())
    process.exit(1)
  })
}

module.exports = { changedScopes, prBody, snapshotHashes }
