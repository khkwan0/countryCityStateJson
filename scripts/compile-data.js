#!/usr/bin/env node
'use strict'

/**
 * Compiles countries-list metadata with country-state-city geography
 * into the published JSON datasets under src/lib/.
 *
 * Full compile (default):
 *   node scripts/compile-data.js
 *
 * Country subset (writes build/subset/core/ unless --force-inplace):
 *   node scripts/compile-data.js --countries=US,CA,MX
 *   node scripts/compile-data.js --countries-file=codes.txt --out-dir=build/subset/core
 */

const fs = require('fs')
const path = require('path')
const { parseCountriesArgv } = require('./lib/countriesArg')

const ROOT = path.join(__dirname, '..')
const COUNTRIES_LIST = require(path.join(ROOT, 'src/countries-list/dist'))
const csc = require(path.join(ROOT, 'src/country-state-city'))

const DEFAULT_OUT_CITIES = path.join(ROOT, 'src/lib/compiledCities.json')
const DEFAULT_OUT_COUNTRY_STATES = path.join(
  ROOT,
  'src/lib/compiledCountryAndStates.json'
)
const DEFAULT_OUT_CITIES_COMPAT = path.join(ROOT, 'lib/compiledCities.json')
const SUBSET_CORE = path.join(ROOT, 'build/subset/core')

function buildCountryIdIndex(cscCountries) {
  const bySortName = new Map()
  for (const country of cscCountries) {
    if (!country || !country.sortname) continue
    bySortName.set(String(country.sortname).toUpperCase(), country)
  }
  return bySortName
}

function stripCityDetails(statesWithCities) {
  const states = {}
  for (const [stateName, cities] of Object.entries(statesWithCities)) {
    const first = Array.isArray(cities) && cities.length > 0 ? cities[0] : null
    states[stateName] = {
      id: first && first.state_id != null ? String(first.state_id) : undefined,
      name: stateName,
    }
  }
  return states
}

function withSilencedConsole(fn) {
  const originalLog = console.log
  console.log = () => {}
  try {
    return fn()
  } finally {
    console.log = originalLog
  }
}

/**
 * @param {{ countries?: string[] | null, forceInplace?: boolean, outDir?: string | null }} [opts]
 */
function compile(opts = {}) {
  const allowlist = opts.countries || null
  const isSubset = Array.isArray(allowlist) && allowlist.length > 0

  const countriesMeta = COUNTRIES_LIST.countries
  if (!countriesMeta || typeof countriesMeta !== 'object') {
    throw new Error('countries-list did not provide a countries object')
  }

  const cscCountries = withSilencedConsole(() => csc.getAllCountries())
  if (!Array.isArray(cscCountries)) {
    throw new Error('country-state-city.getAllCountries() did not return an array')
  }

  const countryIndex = buildCountryIdIndex(cscCountries)
  const compiledCities = {}
  const compiledCountryAndStates = {}

  const missingInCsc = []
  const missingAllowlist = []
  let stateCount = 0
  let cityCount = 0

  let shortNames = Object.keys(countriesMeta)
  if (isSubset) {
    const metaKeys = new Set(shortNames.map((k) => k.toUpperCase()))
    shortNames = []
    for (const code of allowlist) {
      const match = Object.keys(countriesMeta).find((k) => k.toUpperCase() === code)
      if (!match) {
        missingAllowlist.push(code)
        continue
      }
      shortNames.push(match)
    }
    if (!shortNames.length) {
      throw new Error(
        `No matching countries for allowlist: ${allowlist.join(', ')}`
      )
    }
    void metaKeys
  }

  for (const shortName of shortNames) {
    const meta = { ...countriesMeta[shortName] }
    const cscCountry = countryIndex.get(shortName.toUpperCase())

    const statesWithCities = {}
    const statesOnly = {}

    if (!cscCountry) {
      missingInCsc.push(shortName)
      meta.states = {}
      compiledCities[shortName] = meta
      compiledCountryAndStates[shortName] = { ...meta, states: {} }
      continue
    }

    const states = withSilencedConsole(() => csc.getStatesOfCountry(cscCountry.id) || [])
    for (const state of states) {
      if (!state || !state.name) continue
      const cities = withSilencedConsole(() => csc.getCitiesOfState(state.id) || [])
      statesWithCities[state.name] = cities
      statesOnly[state.name] = {
        id: state.id != null ? String(state.id) : undefined,
        name: state.name,
        country_id: state.country_id != null ? String(state.country_id) : undefined,
      }
      stateCount += 1
      cityCount += cities.length
    }

    compiledCities[shortName] = { ...meta, states: statesWithCities }
    compiledCountryAndStates[shortName] = { ...meta, states: statesOnly }
  }

  validate(compiledCities, { missingInCsc, stateCount, cityCount, subset: isSubset })

  let outCities
  let outCountryStates
  let outCompat
  const outputs = []

  if (isSubset && !opts.forceInplace) {
    const outDir = path.resolve(ROOT, opts.outDir || SUBSET_CORE)
    fs.mkdirSync(outDir, { recursive: true })
    outCities = path.join(outDir, 'compiledCities.json')
    outCountryStates = path.join(outDir, 'compiledCountryAndStates.json')
    fs.writeFileSync(outCities, JSON.stringify(compiledCities))
    fs.writeFileSync(outCountryStates, JSON.stringify(compiledCountryAndStates))
    outputs.push(outCities, outCountryStates)
  } else {
    outCities = DEFAULT_OUT_CITIES
    outCountryStates = DEFAULT_OUT_COUNTRY_STATES
    outCompat = DEFAULT_OUT_CITIES_COMPAT
    fs.mkdirSync(path.dirname(outCities), { recursive: true })
    fs.mkdirSync(path.dirname(outCompat), { recursive: true })
    fs.writeFileSync(outCities, JSON.stringify(compiledCities))
    fs.writeFileSync(outCountryStates, JSON.stringify(compiledCountryAndStates))
    fs.writeFileSync(outCompat, JSON.stringify(compiledCities))
    outputs.push(outCities, outCountryStates, outCompat)
  }

  return {
    countries: Object.keys(compiledCities).length,
    states: stateCount,
    cities: cityCount,
    missingInCsc,
    missingAllowlist,
    subset: isSubset,
    outputs,
  }
}

function validate(compiledCities, stats) {
  const codes = Object.keys(compiledCities)
  if (!codes.length) {
    throw new Error('Compile produced zero countries')
  }

  const requiredCountryFields = [
    'name',
    'native',
    'phone',
    'continent',
    'capital',
    'currency',
    'languages',
    'emoji',
    'emojiU',
    'states',
  ]

  if (!stats.subset) {
    if (codes.length < 200) {
      throw new Error(`Expected at least 200 countries, got ${codes.length}`)
    }

    for (const code of ['US', 'CA', 'GB', 'AU', 'IN', 'MX', 'TR', 'AR', 'NG']) {
      const country = compiledCities[code]
      if (!country) {
        throw new Error(`Missing expected country code: ${code}`)
      }
      for (const field of requiredCountryFields) {
        if (typeof country[field] === 'undefined') {
          throw new Error(`Country ${code} missing field: ${field}`)
        }
      }
    }

    const us = compiledCities.US
    if (!us.states || !us.states.California) {
      throw new Error('US is missing California after compile')
    }
    if (!Array.isArray(us.states.California) || us.states.California.length === 0) {
      throw new Error('US/California has no cities after compile')
    }

    const erroneousUsStates = ['Midland', 'Seward', 'Lowa']
    for (const bad of erroneousUsStates) {
      if (us.states[bad]) {
        throw new Error(`US still contains erroneous state: ${bad}`)
      }
    }

    if (stats.cityCount < 1000) {
      throw new Error(`Expected at least 1000 cities, got ${stats.cityCount}`)
    }

    if (stats.missingInCsc.length > 80) {
      throw new Error(
        `Too many countries missing from country-state-city (${stats.missingInCsc.length})`
      )
    }
  } else {
    for (const code of codes) {
      const country = compiledCities[code]
      for (const field of requiredCountryFields) {
        if (typeof country[field] === 'undefined') {
          throw new Error(`Country ${code} missing field: ${field}`)
        }
      }
    }
  }
}

if (require.main === module) {
  try {
    const parsed = parseCountriesArgv(process.argv.slice(2))
    const result = compile({
      countries: parsed.codes,
      forceInplace: parsed.forceInplace,
      outDir: parsed.outDir,
    })
    console.log(
      `Compiled ${result.countries} countries, ${result.states} states, ${result.cities} cities` +
        (result.subset ? ' (subset)' : '')
    )
    if (result.missingAllowlist && result.missingAllowlist.length) {
      console.warn(
        `Warning: unknown country codes skipped: ${result.missingAllowlist.join(', ')}`
      )
    }
    if (result.missingInCsc.length) {
      console.log(
        `Note: ${result.missingInCsc.length} countries have metadata only (no CSC match): ${result.missingInCsc.join(', ')}`
      )
    }
    for (const file of result.outputs) {
      console.log(`Wrote ${path.relative(ROOT, file)}`)
    }
  } catch (err) {
    console.error('Compile failed:', err.message)
    process.exit(1)
  }
}

module.exports = { compile, validate, buildCountryIdIndex, stripCityDetails }
