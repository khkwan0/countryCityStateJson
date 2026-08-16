import db from './lib/compiledCountryAndStates.json' with { type: 'json' };
const typedDb = db;
export function getAll() {
    return typedDb;
}
export function getCountriesShort() {
    return Object.keys(typedDb);
}
export function getCountryByShort(shortName) {
    var _a, _b;
    const code = String(shortName || '');
    return (_b = (_a = typedDb[code]) !== null && _a !== void 0 ? _a : typedDb[code.toUpperCase()]) !== null && _b !== void 0 ? _b : null;
}
export function getCountryInfoByShort(shortName) {
    const country = getCountryByShort(shortName);
    if (!country)
        return null;
    const { states: _states, ...info } = country;
    return { shortName: String(shortName).toUpperCase(), ...info };
}
export function getStatesByShort(shortName) {
    const country = getCountryByShort(shortName);
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
