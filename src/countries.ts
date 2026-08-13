/**
 * Lighter entry point: country metadata + state names/ids only (no city lists).
 * Import via `countrycitystatejson/countries` when you do not need cities.
 */
import db from './lib/compiledCountryAndStates.json'
import type { CountryInfo, CountryStateDatabase, CountryWithStateMeta } from './types'

const typedDb = db as CountryStateDatabase

export function getAll(): CountryStateDatabase {
  return typedDb
}

export function getCountriesShort(): string[] {
  return Object.keys(typedDb)
}

export function getCountryByShort(shortName: string): CountryWithStateMeta | null {
  return typedDb[shortName] ?? null
}

export function getCountryInfoByShort(shortName: string): CountryInfo | null {
  const country = typedDb[shortName]
  if (!country) return null
  const { states: _states, ...info } = country
  return { shortName, ...info }
}

export function getStatesByShort(shortName: string): string[] | null {
  const country = typedDb[shortName]
  if (!country) return null
  if (!country.states) return null
  return Object.keys(country.states)
}

export function getCountries(): CountryInfo[] {
  return Object.keys(typedDb).map((shortName) => {
    const { states: _states, ...info } = typedDb[shortName]
    return { shortName, ...info }
  })
}

export default {
  getAll,
  getCountriesShort,
  getCountryByShort,
  getCountryInfoByShort,
  getStatesByShort,
  getCountries,
}
