#!/usr/bin/env node
'use strict'

/**
 * Makes dist/esm loadable by Node native `import`, without breaking CJS `require`.
 *
 * tsc emits extensionless relative specifiers (`from './server'`) and JSON
 * imports without attributes. Node ESM requires both `.js` extensions and
 * `with { type: 'json' }`.
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const ESM_DIR = path.join(ROOT, 'dist/esm')
const CJS_DIR = path.join(ROOT, 'dist/cjs')

const RELATIVE_SPEC = /^\.\.?(?:\/|$)/
const HAS_EXTENSION = /\.(?:js|mjs|cjs|json|node|d\.ts)$/i

function listFiles(dir, ext) {
  if (!fs.existsSync(dir)) return []
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...listFiles(full, ext))
    else if (entry.name.endsWith(ext)) out.push(full)
  }
  return out
}

function resolveRelativeSpecifier(fromFile, specifier) {
  if (!RELATIVE_SPEC.test(specifier) || HAS_EXTENSION.test(specifier)) {
    return specifier
  }

  const base = path.resolve(path.dirname(fromFile), specifier)
  if (fs.existsSync(`${base}.js`) || fs.existsSync(`${base}.d.ts`)) {
    return `${specifier}.js`
  }
  if (
    fs.existsSync(path.join(base, 'index.js')) ||
    fs.existsSync(path.join(base, 'index.d.ts'))
  ) {
    return `${specifier.replace(/\/$/, '')}/index.js`
  }
  return `${specifier}.js`
}

function rewriteSpecifierQuote(fromFile, quote, specifier) {
  return `${quote}${resolveRelativeSpecifier(fromFile, specifier)}${quote}`
}

function addJsonAttributes(source) {
  let next = source.replace(
    /\bfrom\s+(['"])([^'"]+\.json)\1(?!\s+with\b)(?!\s+assert\b)/g,
    'from $1$2$1 with { type: \'json\' }'
  )
  next = next.replace(
    /\bimport\s*\(\s*(['"])([^'"]+\.json)\1\s*\)/g,
    'import($1$2$1, { with: { type: \'json\' } })'
  )
  return next
}

function rewriteSource(source, fromFile, { jsonAttributes = false } = {}) {
  let next = source.replace(
    /\bfrom\s+(['"])(\.\.?\/[^'"]+)\1/g,
    (match, quote, specifier) => `from ${rewriteSpecifierQuote(fromFile, quote, specifier)}`
  )
  next = next.replace(
    /\bimport\s*\(\s*(['"])(\.\.?\/[^'"]+)\1/g,
    (match, quote, specifier) =>
      `import(${rewriteSpecifierQuote(fromFile, quote, specifier)}`
  )
  next = next.replace(
    /\b(?:import|export)\s+(['"])(\.\.?\/[^'"]+)\1/g,
    (match, quote, specifier) =>
      match.replace(
        `${quote}${specifier}${quote}`,
        rewriteSpecifierQuote(fromFile, quote, specifier)
      )
  )

  if (jsonAttributes) next = addJsonAttributes(next)
  return next
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

function rewriteTree(dir, extensions, options) {
  let changed = 0
  for (const ext of extensions) {
    for (const file of listFiles(dir, ext)) {
      const original = fs.readFileSync(file, 'utf8')
      const updated = rewriteSource(original, file, options)
      if (updated !== original) {
        fs.writeFileSync(file, updated)
        changed += 1
      }
    }
  }
  return changed
}

function fix() {
  if (!fs.existsSync(ESM_DIR) || !fs.existsSync(CJS_DIR)) {
    throw new Error('dist/esm and dist/cjs must exist. Run the TypeScript build first.')
  }

  writeJson(path.join(ESM_DIR, 'package.json'), { type: 'module' })
  writeJson(path.join(CJS_DIR, 'package.json'), { type: 'commonjs' })

  const esmJs = rewriteTree(ESM_DIR, ['.js'], { jsonAttributes: true })
  const esmDts = rewriteTree(ESM_DIR, ['.d.ts'], { jsonAttributes: false })
  const cjsDts = rewriteTree(CJS_DIR, ['.d.ts'], { jsonAttributes: false })

  return { esmJs, esmDts, cjsDts }
}

if (require.main === module) {
  try {
    const result = fix()
    console.log(
      `Dual-package fix: marked dist/esm as ESM, dist/cjs as CJS; rewrote ${result.esmJs} ESM JS, ${result.esmDts} ESM d.ts, ${result.cjsDts} CJS d.ts`
    )
  } catch (err) {
    console.error('fix-dual-package failed:', err.message)
    process.exit(1)
  }
}

module.exports = {
  addJsonAttributes,
  fix,
  resolveRelativeSpecifier,
  rewriteSource,
}
