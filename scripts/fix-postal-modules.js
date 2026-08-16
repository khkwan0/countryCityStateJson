#!/usr/bin/env node
'use strict'

/**
 * Rewrite postal package dist/esm for Node native import
 * (relative .js extensions + JSON import attributes).
 */

const fs = require('fs')
const path = require('path')

const scope = process.argv[2]
if (scope !== 'us' && scope !== 'world') {
  console.error('Usage: node scripts/fix-postal-modules.js <us|world>')
  process.exit(1)
}

const ROOT = path.join(__dirname, '..')
const pkg = path.join(ROOT, 'packages', `postal-${scope}`)
const ESM_DIR = path.join(pkg, 'dist/esm')
const CJS_DIR = path.join(pkg, 'dist/cjs')

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
    "from $1$2$1 with { type: 'json' }"
  )
  next = next.replace(
    /\bimport\s*\(\s*(['"])([^'"]+\.json)\1\s*\)/g,
    "import($1$2$1, { with: { type: 'json' } })"
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
  if (jsonAttributes) next = addJsonAttributes(next)
  return next
}

function writePackageType(dir, type) {
  fs.writeFileSync(path.join(dir, 'package.json'), `${JSON.stringify({ type }, null, 2)}\n`)
}

function fix() {
  for (const file of listFiles(ESM_DIR, '.js')) {
    const src = fs.readFileSync(file, 'utf8')
    const next = rewriteSource(src, file, { jsonAttributes: true })
    if (next !== src) fs.writeFileSync(file, next)
  }
  writePackageType(ESM_DIR, 'module')
  writePackageType(CJS_DIR, 'commonjs')
  console.log(`Fixed postal modules for ${scope}`)
}

fix()
