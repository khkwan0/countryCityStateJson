export type PostalBridge = 'exact' | 'state-only'

/** Compact on-disk hit: [city, state, bridge] */
export type PostalHitTuple = [string, string, PostalBridge]

/** postalCode -> hits within one country */
export type CountryPostalIndex = Record<string, PostalHitTuple[]>

/** postalCode -> country codes that contain it (within package scope) */
export type PostalToCountries = Record<string, string[]>

export interface PostalCityResult {
  city: string
  state: string
  countryCode: string
  postalCode: string
  bridge: PostalBridge
}

/** Dynamic JSON import; tuples arrive as string[][] from resolveJsonModule. */
export type CountryPostalLoader = () => Promise<unknown>
