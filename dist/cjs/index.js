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
var compiledCities_json_1 = __importDefault(require("./lib/compiledCities.json"));
var trie_search_1 = __importDefault(require("trie-search"));
var typedDb = compiledCities_json_1.default;
var trie = new trie_search_1.default('city', {
    min: 2,
    splitOnRegEx: false,
});
for (var countryName in typedDb) {
    for (var state in typedDb[countryName].states) {
        for (var idx in typedDb[countryName].states[state]) {
            var toSave = {
                city: typedDb[countryName].states[state][idx],
                state: state,
                country: typedDb[countryName],
            };
            var key = typedDb[countryName].states[state][idx].name;
            trie.map(key, toSave);
        }
    }
}
function getAll() { return typedDb; }
function getCountriesShort() {
    var res = [];
    for (var key in typedDb) {
        res.push(key);
    }
    return res;
}
function getCountryByShort(shortName) {
    if (typeof typedDb[shortName] !== 'undefined') {
        return typedDb[shortName];
    }
    else {
        return null;
    }
}
function getCountryInfoByShort(shortName) {
    if (typeof typedDb[shortName] !== 'undefined') {
        var res = {};
        for (var key in typedDb[shortName]) {
            if (key !== 'states') {
                res[key] = typedDb[shortName][key];
            }
        }
        return res;
    }
    else {
        return null;
    }
}
function getStatesByShort(shortName) {
    if (typeof typedDb[shortName] !== 'undefined') {
        if (typeof typedDb[shortName].states !== 'undefined') {
            return Object.keys(typedDb[shortName].states);
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
}
function getCities(shortName, state) {
    if (typeof typedDb[shortName] !== 'undefined') {
        if (typeof typedDb[shortName].states !== 'undefined') {
            var res = [];
            for (var idx in typedDb[shortName].states[state]) {
                res.push(typedDb[shortName].states[state][idx].name);
            }
            return res;
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
}
function getCountries() {
    var res = [];
    for (var shortName in typedDb) {
        var obj = { shortName: shortName };
        for (var key in typedDb[shortName]) {
            if (key !== 'states') {
                obj[key] = typedDb[shortName][key];
            }
        }
        res.push(obj);
    }
    return res;
}
function getCitiesByName(name) {
    return trie.search(name);
}
exports.default = {
    getAll: getAll,
    getCountriesShort: getCountriesShort,
    getCountryByShort: getCountryByShort,
    getCountryInfoByShort: getCountryInfoByShort,
    getStatesByShort: getStatesByShort,
    getCities: getCities,
    getCountries: getCountries,
    getCitiesByName: getCitiesByName,
};
