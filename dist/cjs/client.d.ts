import { getCountries as getCountriesMeta, getCountriesShort as getCountriesShortMeta, getCountryByShort as getCountryMetaByShort, getCountryInfoByShort as getCountryInfoByShortMeta, getStatesByShort as getStatesByShortMeta } from './meta';
import type { CitySearchResult, Country } from './types';
/** Sync metadata helpers (no city payloads). */
export declare const getCountriesShort: typeof getCountriesShortMeta;
export declare const getCountries: typeof getCountriesMeta;
export declare const getCountryInfoByShort: typeof getCountryInfoByShortMeta;
export declare const getStatesByShort: typeof getStatesByShortMeta;
export { getCountryMetaByShort };
/** Prefetch and cache a country's full city dataset. */
export declare function preloadCountry(shortName: string): Promise<Country | null>;
/** Async: full country record including city arrays. */
export declare function getCountryByShort(shortName: string): Promise<Country | null>;
/** Async: city names for a state (loads that country chunk on demand). */
export declare function getCities(shortName: string, state: string): Promise<string[] | null>;
/**
 * Async city name search scoped to one country (avoids loading the world).
 */
export declare function getCitiesByName(name: string, shortName: string): Promise<CitySearchResult[]>;
export declare function clearClientCache(): void;
declare const _default: {
    getCountriesShort: typeof getCountriesShortMeta;
    getCountries: typeof getCountriesMeta;
    getCountryInfoByShort: typeof getCountryInfoByShortMeta;
    getStatesByShort: typeof getStatesByShortMeta;
    getCountryMetaByShort: typeof getCountryMetaByShort;
    preloadCountry: typeof preloadCountry;
    getCountryByShort: typeof getCountryByShort;
    getCities: typeof getCities;
    getCitiesByName: typeof getCitiesByName;
    clearClientCache: typeof clearClientCache;
};
export default _default;
//# sourceMappingURL=client.d.ts.map