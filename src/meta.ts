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
  const code = String(shortName || '')
  return typedDb[code] ?? typedDb[code.toUpperCase()] ?? null
}

export function getCountryInfoByShort(shortName: string): CountryInfo | null {
  const country = getCountryByShort(shortName)
  if (!country) return null
  const { states: _states, ...info } = country
  return { shortName: String(shortName).toUpperCase(), ...info }
}

export function getStatesByShort(shortName: string): string[] | null {
  const country = getCountryByShort(shortName)
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
