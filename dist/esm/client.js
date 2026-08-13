/**
 * Client-optimized API.
 *
 * - Sync methods use the lightweight countries+states dataset (~300KB).
 * - City data is lazy-loaded per country via code-split JSON chunks.
 *
 * Import via `countrycitystatejson/client`.
 */
import TrieSearch from 'trie-search';
import { countryLoaders } from './client/countryLoaders.generated';
import { getCountries as getCountriesMeta, getCountriesShort as getCountriesShortMeta, getCountryByShort as getCountryMetaByShort, getCountryInfoByShort as getCountryInfoByShortMeta, getStatesByShort as getStatesByShortMeta, } from './meta';
const countryCache = new Map();
const trieCache = new Map();
function normalizeCode(shortName) {
    return String(shortName || '').toUpperCase();
}
function unwrapCountryModule(mod) {
    if (mod && typeof mod === 'object' && 'default' in mod && mod.default) {
        return mod.default;
    }
    return mod;
}
/** Sync metadata helpers (no city payloads). */
export const getCountriesShort = getCountriesShortMeta;
export const getCountries = getCountriesMeta;
export const getCountryInfoByShort = getCountryInfoByShortMeta;
export const getStatesByShort = getStatesByShortMeta;
export { getCountryMetaByShort };
/** Prefetch and cache a country's full city dataset. */
export async function preloadCountry(shortName) {
    const code = normalizeCode(shortName);
    if (countryCache.has(code))
        return countryCache.get(code);
    const loader = countryLoaders[code];
    if (!loader)
        return null;
    const country = unwrapCountryModule(await loader());
    countryCache.set(code, country);
    return country;
}
/** Async: full country record including city arrays. */
export async function getCountryByShort(shortName) {
    return preloadCountry(shortName);
}
/** Async: city names for a state (loads that country chunk on demand). */
export async function getCities(shortName, state) {
    const country = await preloadCountry(shortName);
    if (!country)
        return null;
    if (!country.states)
        return null;
    const cities = country.states[state];
    if (!cities)
        return [];
    return cities.map((city) => city.name).filter(Boolean);
}
function getCountryTrie(code, country) {
    const cached = trieCache.get(code);
    if (cached)
        return cached;
    const trie = new TrieSearch([], {
        min: 2,
        splitOnRegEx: false,
    });
    for (const state of Object.keys(country.states || {})) {
        for (const city of country.states[state] || []) {
            if (!(city === null || city === void 0 ? void 0 : city.name))
                continue;
            trie.map(city.name, { city, state, country });
        }
    }
    trieCache.set(code, trie);
    return trie;
}
/**
 * Async city name search scoped to one country (avoids loading the world).
 */
export async function getCitiesByName(name, shortName) {
    const code = normalizeCode(shortName);
    const country = await preloadCountry(code);
    if (!country)
        return [];
    return getCountryTrie(code, country).search(name);
}
export function clearClientCache() {
    countryCache.clear();
    trieCache.clear();
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
};
