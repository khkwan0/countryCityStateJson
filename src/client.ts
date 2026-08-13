/**
 * Client-optimized API.
 *
 * - Sync methods use the lightweight countries+states dataset (~300KB).
 * - City data is lazy-loaded per country via code-split JSON chunks.
 *
 * Import via `countrycitystatejson/client`.
 */
import TrieSearch from 'trie-search'
import { countryLoaders } from './client/countryLoaders.generated'
import {
  getCountries as getCountriesMeta,
  getCountriesShort as getCountriesShortMeta,
  getCountryByShort as getCountryMetaByShort,
  getCountryInfoByShort as getCountryInfoByShortMeta,
  getStatesByShort as getStatesByShortMeta,
} from './meta'
import type { City, CitySearchResult, Country } from './types'

const countryCache = new Map<string, Country>()
const trieCache = new Map<string, TrieSearch<CitySearchResult>>()

function normalizeCode(shortName: string): string {
  return String(shortName || '').toUpperCase()
}

function unwrapCountryModule(mod: { default: Country } | Country): Country {
  if (mod && typeof mod === 'object' && 'default' in mod && (mod as { default: Country }).default) {
    return (mod as { default: Country }).default
  }
  return mod as Country
}

/** Sync metadata helpers (no city payloads). */
export const getCountriesShort = getCountriesShortMeta
export const getCountries = getCountriesMeta
export const getCountryInfoByShort = getCountryInfoByShortMeta
export const getStatesByShort = getStatesByShortMeta
export { getCountryMetaByShort }

/** Prefetch and cache a country's full city dataset. */
export async function preloadCountry(shortName: string): Promise<Country | null> {
  const code = normalizeCode(shortName)
  if (countryCache.has(code)) return countryCache.get(code)!

  const loader = countryLoaders[code]
  if (!loader) return null

  const country = unwrapCountryModule(await loader())
  countryCache.set(code, country)
  return country
}

/** Async: full country record including city arrays. */
export async function getCountryByShort(shortName: string): Promise<Country | null> {
  return preloadCountry(shortName)
}

/** Async: city names for a state (loads that country chunk on demand). */
export async function getCities(shortName: string, state: string): Promise<string[] | null> {
  const country = await preloadCountry(shortName)
  if (!country) return null
  if (!country.states) return null
  const cities = country.states[state]
  if (!cities) return []
  return cities.map((city: City) => city.name).filter(Boolean)
}

function getCountryTrie(code: string, country: Country): TrieSearch<CitySearchResult> {
  const cached = trieCache.get(code)
  if (cached) return cached

  const trie = new TrieSearch<CitySearchResult>([], {
    min: 2,
    splitOnRegEx: false,
  })

  for (const state of Object.keys(country.states || {})) {
    for (const city of country.states[state] || []) {
      if (!city?.name) continue
      trie.map(city.name, { city, state, country })
    }
  }

  trieCache.set(code, trie)
  return trie
}

/**
 * Async city name search scoped to one country (avoids loading the world).
 */
export async function getCitiesByName(
  name: string,
  shortName: string
): Promise<CitySearchResult[]> {
  const code = normalizeCode(shortName)
  const country = await preloadCountry(code)
  if (!country) return []
  return getCountryTrie(code, country).search(name)
}

export function clearClientCache(): void {
  countryCache.clear()
  trieCache.clear()
}

export default {
  getCountriesShort,
  getCountries,
  getCountryInfoByShort,
  getStatesByShort,
  getCountryMetaByShort,
  preloadCountry,
  getCountryByShort,
  getCities,
  getCitiesByName,
  clearClientCache,
}
