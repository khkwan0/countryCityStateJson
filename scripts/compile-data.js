#!/usr/bin/env node
'use strict'

/**
 * Compiles countries-list metadata with country-state-city geography
 * into the published JSON datasets under src/lib/.
 *
 * Sources (editable):
 *   - src/countries-list/dist
 *   - src/country-state-city
 *
 * Outputs:
 *   - src/lib/compiledCities.json
 *   - src/lib/compiledCountryAndStates.json
 *   - lib/compiledCities.json (compat copy for root index.js consumers)
 *
 * Note: compiledCities.json may contain curated corrections that are not yet
 * fully represented in the vendored sources. Always review diffs for AR, IN,
 * MX, TR, and ZA (and any other recently fixed regions) before committing a
 * fresh compile.
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const COUNTRIES_LIST = require(path.join(ROOT, 'src/countries-list/dist'))
const csc = require(path.join(ROOT, 'src/country-state-city'))

const OUT_CITIES = path.join(ROOT, 'src/lib/compiledCities.json')
const OUT_COUNTRY_STATES = path.join(ROOT, 'src/lib/compiledCountryAndStates.json')
const OUT_CITIES_COMPAT = path.join(ROOT, 'lib/compiledCities.json')

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

function compile() {
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
  let stateCount = 0
  let cityCount = 0

  for (const shortName of Object.keys(countriesMeta)) {
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

  validate(compiledCities, { missingInCsc, stateCount, cityCount })

  fs.mkdirSync(path.dirname(OUT_CITIES), { recursive: true })
  fs.mkdirSync(path.dirname(OUT_CITIES_COMPAT), { recursive: true })

  fs.writeFileSync(OUT_CITIES, JSON.stringify(compiledCities))
  fs.writeFileSync(OUT_COUNTRY_STATES, JSON.stringify(compiledCountryAndStates))
  fs.writeFileSync(OUT_CITIES_COMPAT, JSON.stringify(compiledCities))

  return {
    countries: Object.keys(compiledCities).length,
    states: stateCount,
    cities: cityCount,
    missingInCsc,
    outputs: [OUT_CITIES, OUT_COUNTRY_STATES, OUT_CITIES_COMPAT],
  }
}

function validate(compiledCities, stats) {
  const codes = Object.keys(compiledCities)
  if (codes.length < 200) {
    throw new Error(`Expected at least 200 countries, got ${codes.length}`)
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
}

if (require.main === module) {
  try {
    const result = compile()
    console.log(
      `Compiled ${result.countries} countries, ${result.states} states, ${result.cities} cities`
    )
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
