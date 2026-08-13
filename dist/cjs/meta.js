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
exports.getCountries = getCountries;
const compiledCountryAndStates_json_1 = __importDefault(require("./lib/compiledCountryAndStates.json"));
const typedDb = compiledCountryAndStates_json_1.default;
function getAll() {
    return typedDb;
}
function getCountriesShort() {
    return Object.keys(typedDb);
}
function getCountryByShort(shortName) {
    var _a, _b;
    const code = String(shortName || '');
    return (_b = (_a = typedDb[code]) !== null && _a !== void 0 ? _a : typedDb[code.toUpperCase()]) !== null && _b !== void 0 ? _b : null;
}
function getCountryInfoByShort(shortName) {
    const country = getCountryByShort(shortName);
    if (!country)
        return null;
    const { states: _states, ...info } = country;
    return { shortName: String(shortName).toUpperCase(), ...info };
}
function getStatesByShort(shortName) {
    const country = getCountryByShort(shortName);
    if (!country)
        return null;
    if (!country.states)
        return null;
    return Object.keys(country.states);
}
function getCountries() {
    return Object.keys(typedDb).map((shortName) => {
        const { states: _states, ...info } = typedDb[shortName];
        return { shortName, ...info };
    });
}
exports.default = {
    getAll,
    getCountriesShort,
    getCountryByShort,
    getCountryInfoByShort,
    getStatesByShort,
    getCountries,
};
