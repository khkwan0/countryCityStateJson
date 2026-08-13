"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = getAll;
exports.getCountriesShort = getCountriesShort;
exports.getCountryByShort = getCountryByShort;
exports.getCountryInfoByShort = getCountryInfoByShort;
exports.getStatesByShort = getStatesByShort;
exports.getCities = getCities;
exports.getCountries = getCountries;
exports.getCitiesByName = getCitiesByName;
const compiledCities_json_1 = __importDefault(require("./lib/compiledCities.json"));
const trie_search_1 = __importDefault(require("trie-search"));
/**
 * Server-optimized API: synchronous access to the full in-memory dataset.
 * Prefer `countrycitystatejson/server` (or the package root) in Node/SSR.
 */
const typedDb = compiledCities_json_1.default;
let cityTrie = null;
function getCityTrie() {
    if (cityTrie)
        return cityTrie;
    const trie = new trie_search_1.default([], {
        min: 2,
        splitOnRegEx: false,
    });
    for (const countryName of Object.keys(typedDb)) {
        const country = typedDb[countryName];
        const states = country.states || {};
        for (const state of Object.keys(states)) {
            const cities = states[state] || [];
            for (const city of cities) {
                if (!city || !city.name)
                    continue;
                trie.map(city.name, {
                    city,
                    state,
                    country,
                });
            }
        }
    }
    cityTrie = trie;
    return trie;
}
function getAll() {
    return typedDb;
}
function getCountriesShort() {
    return Object.keys(typedDb);
}
function getCountryByShort(shortName) {
    var _a;
    return (_a = typedDb[shortName]) !== null && _a !== void 0 ? _a : null;
}
function getCountryInfoByShort(shortName) {
    const country = typedDb[shortName];
    if (!country)
        return null;
    const { states: _states, ...info } = country;
    return { shortName, ...info };
}
function getStatesByShort(shortName) {
    const country = typedDb[shortName];
    if (!country)
        return null;
    if (!country.states)
        return null;
    return Object.keys(country.states);
}
function getCities(shortName, state) {
    const country = typedDb[shortName];
    if (!country)
        return null;
    if (!country.states)
        return null;
    const cities = country.states[state];
    if (!cities)
        return [];
    return cities.map((city) => city.name).filter(Boolean);
}
function getCountries() {
    return Object.keys(typedDb).map((shortName) => {
        const { states: _states, ...info } = typedDb[shortName];
        return { shortName, ...info };
    });
}
function getCitiesByName(name) {
    return getCityTrie().search(name);
}
const api = {
    getAll,
    getCountriesShort,
    getCountryByShort,
    getCountryInfoByShort,
    getStatesByShort,
    getCities,
    getCountries,
    getCitiesByName,
};
exports.default = api;
