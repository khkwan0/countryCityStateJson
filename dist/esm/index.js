import db from './lib/compiledCities.json';
import TrieSearch from 'trie-search';
const typedDb = db;
let cityTrie = null;
function getCityTrie() {
    if (cityTrie)
        return cityTrie;
    const trie = new TrieSearch([], {
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
                const toSave = {
                    city,
                    state,
                    country,
                };
                trie.map(city.name, toSave);
            }
        }
    }
    cityTrie = trie;
    return trie;
}
export function getAll() {
    return typedDb;
}
export function getCountriesShort() {
    return Object.keys(typedDb);
}
export function getCountryByShort(shortName) {
    var _a;
    return (_a = typedDb[shortName]) !== null && _a !== void 0 ? _a : null;
}
export function getCountryInfoByShort(shortName) {
    const country = typedDb[shortName];
    if (!country)
        return null;
    const { states: _states, ...info } = country;
    return { shortName, ...info };
}
export function getStatesByShort(shortName) {
    const country = typedDb[shortName];
    if (!country)
        return null;
    if (!country.states)
        return null;
    return Object.keys(country.states);
}
export function getCities(shortName, state) {
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
export function getCountries() {
    return Object.keys(typedDb).map((shortName) => {
        const { states: _states, ...info } = typedDb[shortName];
        return { shortName, ...info };
    });
}
export function getCitiesByName(name) {
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
export default api;
