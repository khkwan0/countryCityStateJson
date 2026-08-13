/**
 * Lighter entry point: country metadata + state names/ids only (no city lists).
 * Import via `countrycitystatejson/countries` when you do not need cities.
 */
import db from './lib/compiledCountryAndStates.json';
const typedDb = db;
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
export function getCountries() {
    return Object.keys(typedDb).map((shortName) => {
        const { states: _states, ...info } = typedDb[shortName];
        return { shortName, ...info };
    });
}
export default {
    getAll,
    getCountriesShort,
    getCountryByShort,
    getCountryInfoByShort,
    getStatesByShort,
    getCountries,
};
