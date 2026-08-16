"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCountryMetaByShort = exports.getStatesByShort = exports.getCountryInfoByShort = exports.getCountries = exports.getCountriesShort = void 0;
exports.preloadCountry = preloadCountry;
exports.getCountryByShort = getCountryByShort;
exports.getCities = getCities;
exports.getCitiesByName = getCitiesByName;
exports.clearClientCache = clearClientCache;
/**
 * Client-optimized API.
 *
 * - Sync methods use the lightweight countries+states dataset (~300KB).
 * - City data is lazy-loaded per country via code-split JSON chunks.
 *
 * Import via `countrycitystatejson/client`.
 */
const trie_search_1 = __importDefault(require("trie-search"));
const countryLoaders_generated_1 = require("./client/countryLoaders.generated");
const meta_1 = require("./meta");
Object.defineProperty(exports, "getCountryMetaByShort", { enumerable: true, get: function () { return meta_1.getCountryByShort; } });
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
exports.getCountriesShort = meta_1.getCountriesShort;
exports.getCountries = meta_1.getCountries;
exports.getCountryInfoByShort = meta_1.getCountryInfoByShort;
exports.getStatesByShort = meta_1.getStatesByShort;
/** Prefetch and cache a country's full city dataset. */
async function preloadCountry(shortName) {
    const code = normalizeCode(shortName);
    if (countryCache.has(code))
        return countryCache.get(code);
    const loader = countryLoaders_generated_1.countryLoaders[code];
    if (!loader)
        return null;
    const country = unwrapCountryModule(await loader());
    countryCache.set(code, country);
    return country;
}
/** Async: full country record including city arrays. */
async function getCountryByShort(shortName) {
    return preloadCountry(shortName);
}
/** Async: city names for a state (loads that country chunk on demand). */
async function getCities(shortName, state) {
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
    const trie = new trie_search_1.default([], {
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
async function getCitiesByName(name, shortName) {
    const code = normalizeCode(shortName);
    const country = await preloadCountry(code);
    if (!country)
        return [];
    return getCountryTrie(code, country).search(name);
}
function clearClientCache() {
    countryCache.clear();
    trieCache.clear();
}
exports.default = {
    getCountriesShort: exports.getCountriesShort,
    getCountries: exports.getCountries,
    getCountryInfoByShort: exports.getCountryInfoByShort,
    getStatesByShort: exports.getStatesByShort,
    getCountryMetaByShort: meta_1.getCountryByShort,
    preloadCountry,
    getCountryByShort,
    getCities,
    getCitiesByName,
    clearClientCache,
};
