import type {
  CountryPostalIndex,
  CountryPostalLoader,
  PostalBridge,
  PostalCityResult,
  PostalToCountries,
} from './types'

export interface PostalApiOptions {
  countryLoaders: Record<string, CountryPostalLoader>
  /** Sync inverted index (postal -> country codes in this package scope) */
  postalToCountries: PostalToCountries
}

function normalizePostal(postalCode: string): string {
  return String(postalCode || '').trim().toUpperCase()
}

function normalizeCountry(code: string): string {
  return String(code || '').trim().toUpperCase()
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function unwrapIndex(mod: unknown): CountryPostalIndex {
  if (isPlainObject(mod) && 'default' in mod && isPlainObject(mod.default)) {
    return mod.default as CountryPostalIndex
  }
  if (isPlainObject(mod)) return mod as CountryPostalIndex
  return {}
}

function asBridge(value: unknown): PostalBridge | null {
  if (value === 'exact' || value === 'state-only') return value
  return null
}

function expandHits(
  postalCode: string,
  countryCode: string,
  hits: unknown
): PostalCityResult[] {
  if (!Array.isArray(hits) || !hits.length) return []
  const out: PostalCityResult[] = []
  for (const raw of hits) {
    if (!Array.isArray(raw) || raw.length < 3) continue
    const bridge = asBridge(raw[2])
    if (!bridge) continue
    out.push({
      city: String(raw[0]),
      state: String(raw[1]),
      countryCode,
      postalCode,
      bridge,
    })
  }
  return out
}

export function createPostalApi(options: PostalApiOptions) {
  const { countryLoaders, postalToCountries } = options
  const cache = new Map<string, CountryPostalIndex>()

  async function loadCountry(code: string): Promise<CountryPostalIndex | null> {
    const normalized = normalizeCountry(code)
    if (cache.has(normalized)) return cache.get(normalized)!
    const loader = countryLoaders[normalized]
    if (!loader) return null
    const index = unwrapIndex(await loader())
    cache.set(normalized, index)
    return index
  }

  async function preloadCountryPostal(countryCode: string): Promise<boolean> {
    const index = await loadCountry(countryCode)
    return index != null
  }

  function clearPostalCache(): void {
    cache.clear()
  }

  /**
   * Return every matching (country, state, city) for a postal code.
   * Optional countryCode filters to that country only.
   */
  async function getCitiesByPostalCode(
    postalCode: string,
    countryCode?: string
  ): Promise<PostalCityResult[]> {
    const postal = normalizePostal(postalCode)
    if (!postal) return []

    if (countryCode != null && String(countryCode).trim() !== '') {
      const code = normalizeCountry(countryCode)
      const index = await loadCountry(code)
      if (!index) return []
      return expandHits(postal, code, index[postal])
    }

    const countries = postalToCountries[postal] || []
    if (!countries.length) return []

    const results: PostalCityResult[] = []
    for (const code of countries) {
      const index = await loadCountry(code)
      if (!index) continue
      results.push(...expandHits(postal, code, index[postal]))
    }
    return results
  }

  return {
    getCitiesByPostalCode,
    preloadCountryPostal,
    clearPostalCache,
  }
}

export type PostalApi = ReturnType<typeof createPostalApi>
