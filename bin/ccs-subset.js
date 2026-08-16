#!/usr/bin/env node
'use strict'

/**
 * Consumer CLI: filter installed countrycitystatejson (+ optional postal) data
 * down to a user-defined country list. Writes raw JSON — not a full npm package.
 *
 *   npx ccs-subset --countries=US,CA --out=./geo-us-ca
 *   npx ccs-subset --countries=US,CA --out=./geo-us-ca --postal=us
 *   npx ccs-subset --countries=DE,FR --out=./geo-eu --postal=world
 */

const fs = require('fs')
const path = require('path')
const {
  pickCountries,
  buildInverted,
  parseCountriesList,
} = require('./lib/subsetHelpers')

function usage() {
  console.log(`Usage:
  ccs-subset --countries=US,CA --out=./dir
  ccs-subset --countries=US,CA --out=./dir --postal=us|world

Writes filtered compiledCities.json (+ meta if available).
With --postal, also writes postal-by-country/ and postal-to-countries.json
from the matching countrycitystatejson-postal-* package.`)
}

function parseArgv(argv) {
  let countries = null
  let out = null
  let postal = null
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '-h' || arg === '--help') return { help: true }
    if (arg.startsWith('--countries=')) {
      countries = parseCountriesList(arg.slice('--countries='.length))
    } else if (arg === '--countries') {
      countries = parseCountriesList(argv[++i])
    } else if (arg.startsWith('--out=')) {
      out = arg.slice('--out='.length)
    } else if (arg === '--out') {
      out = argv[++i]
    } else if (arg.startsWith('--postal=')) {
      postal = arg.slice('--postal='.length)
    } else if (arg === '--postal') {
      postal = argv[++i]
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }
  return { countries, out, postal }
}

function resolvePkgRoot(name) {
  try {
    return path.dirname(require.resolve(`${name}/package.json`))
  } catch {
    throw new Error(
      `Cannot resolve package "${name}". Install it first (npm i ${name}).`
    )
  }
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function subsetCore(codes, outDir) {
  const root = resolvePkgRoot('countrycitystatejson')
  const citiesPath = path.join(root, 'dist/cjs/lib/compiledCities.json')
  const metaPath = path.join(root, 'dist/cjs/lib/compiledCountryAndStates.json')
  if (!fs.existsSync(citiesPath)) {
    throw new Error(`Missing ${citiesPath} — is countrycitystatejson built/published?`)
  }

  const cities = loadJson(citiesPath)
  const { picked, missing } = pickCountries(cities, codes)
  if (!Object.keys(picked).length) {
    throw new Error(`No countries matched: ${codes.join(', ')}`)
  }

  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'compiledCities.json'), JSON.stringify(picked))

  if (fs.existsSync(metaPath)) {
    const meta = loadJson(metaPath)
    const metaPick = pickCountries(meta, codes)
    fs.writeFileSync(
      path.join(outDir, 'compiledCountryAndStates.json'),
      JSON.stringify(metaPick.picked)
    )
  }

  return { countries: Object.keys(picked).length, missing }
}

function subsetPostal(codes, outDir, scope) {
  if (scope !== 'us' && scope !== 'world') {
    throw new Error('--postal must be "us" or "world"')
  }
  const name = `countrycitystatejson-postal-${scope}`
  const root = resolvePkgRoot(name)
  const libCandidates = [
    path.join(root, 'dist/cjs/lib'),
    path.join(root, 'src/lib'),
  ]
  const libDir = libCandidates.find((p) =>
    fs.existsSync(path.join(p, 'postal-by-country'))
  )
  if (!libDir) {
    throw new Error(
      `No postal-by-country data found in ${name}. Build or install a published package.`
    )
  }

  const byCountrySrc = path.join(libDir, 'postal-by-country')
  const indexes = Object.create(null)
  const missing = []
  for (const code of codes) {
    const file = path.join(byCountrySrc, `${code}.json`)
    if (!fs.existsSync(file)) {
      missing.push(code)
      continue
    }
    indexes[code] = loadJson(file)
  }
  if (!Object.keys(indexes).length) {
    throw new Error(
      `No postal country files matched in ${name} for: ${codes.join(', ')}`
    )
  }

  const postalOut = path.join(outDir, 'postal')
  const byCountryOut = path.join(postalOut, 'postal-by-country')
  fs.mkdirSync(byCountryOut, { recursive: true })
  for (const [code, index] of Object.entries(indexes)) {
    fs.writeFileSync(path.join(byCountryOut, `${code}.json`), JSON.stringify(index))
  }
  const inverted = buildInverted(indexes)
  fs.writeFileSync(
    path.join(postalOut, 'postal-to-countries.json'),
    JSON.stringify(inverted)
  )
  return {
    countries: Object.keys(indexes).length,
    postals: Object.keys(inverted).length,
    missing,
  }
}

function main() {
  let opts
  try {
    opts = parseArgv(process.argv.slice(2))
  } catch (err) {
    console.error(err.message)
    usage()
    process.exit(1)
  }

  if (opts.help || !opts.countries || !opts.out) {
    usage()
    process.exit(opts.help ? 0 : 1)
  }

  const outDir = path.resolve(opts.out)
  try {
    const core = subsetCore(opts.countries, outDir)
    console.log(
      `Wrote core subset (${core.countries} countries) → ${outDir}`
    )
    if (core.missing.length) {
      console.warn(`Warning: missing from core: ${core.missing.join(', ')}`)
    }

    if (opts.postal) {
      const postal = subsetPostal(opts.countries, outDir, opts.postal)
      console.log(
        `Wrote postal subset (${postal.countries} countries, ${postal.postals} postals) → ${path.join(outDir, 'postal')}`
      )
      if (postal.missing.length) {
        console.warn(`Warning: missing from postal: ${postal.missing.join(', ')}`)
      }
    }
  } catch (err) {
    console.error(err.message || err)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { subsetCore, subsetPostal, parseArgv }
