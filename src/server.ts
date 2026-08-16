import db from './lib/compiledCities.json'
import TrieSearch from 'trie-search'
import type {
  CitySearchResult,
  CompCities,
  Country,
  CountryInfo,
  Database,
} from './types'

/**
 * Server-optimized API: synchronous access to the full in-memory dataset.
 * Prefer `countrycitystatejson/server` (or the package root) in Node/SSR.
 */
const typedDb = db as Database

let cityTrie: TrieSearch<CitySearchResult> | null = null

function getCityTrie(): TrieSearch<CitySearchResult> {
  if (cityTrie) return cityTrie

  const trie = new TrieSearch<CitySearchResult>([], {
    min: 2,
    splitOnRegEx: false,
  })

  for (const countryName of Object.keys(typedDb)) {
    const country = typedDb[countryName]
    const states = country.states || {}
    for (const state of Object.keys(states)) {
      const cities = states[state] || []
      for (const city of cities) {
        if (!city || !city.name) continue
        trie.map(city.name, {
          city,
          state,
          country,
        })
      }
    }
  }

  cityTrie = trie
  return trie
}

export function getAll(): Database {
  return typedDb
}

export function getCountriesShort(): string[] {
  return Object.keys(typedDb)
}

export function getCountryByShort(shortName: string): Country | null {
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

export function getCities(shortName: string, state: string): string[] | null {
  const country = typedDb[shortName]
  if (!country) return null
  if (!country.states) return null
  const cities = country.states[state]
  if (!cities) return []
  return cities.map((city) => city.name).filter(Boolean)
}

export function getCountries(): CountryInfo[] {
  return Object.keys(typedDb).map((shortName) => {
    const { states: _states, ...info } = typedDb[shortName]
    return { shortName, ...info }
  })
}

export function getCitiesByName(name: string): CitySearchResult[] {
  return getCityTrie().search(name)
}

const api: CompCities = {
  getAll,
  getCountriesShort,
  getCountryByShort,
  getCountryInfoByShort,
  getStatesByShort,
  getCities,
  getCountries,
  getCitiesByName,
}

export default api
