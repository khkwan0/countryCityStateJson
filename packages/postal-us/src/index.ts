import postalToCountries from './lib/postal-to-countries.json'
import { createPostalApi } from './shared/createPostalApi'
import { countryLoaders } from './loaders.generated'
import type { PostalCityResult } from './shared/types'

const api = createPostalApi({
  countryLoaders,
  postalToCountries: postalToCountries as Record<string, string[]>,
})

export const getCitiesByPostalCode = api.getCitiesByPostalCode
export const preloadCountryPostal = api.preloadCountryPostal
export const clearPostalCache = api.clearPostalCache

export type { PostalCityResult }

const postal = {
  getCitiesByPostalCode,
  preloadCountryPostal,
  clearPostalCache,
  scope: 'us' as const,
}

export default postal
