"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compiledCities_json_1 = __importDefault(require("../lib/compiledCities.json"));
const trie_search_1 = __importDefault(require("trie-search"));
const trie = new trie_search_1.default([], {
    min: 2,
    splitOnRegEx: false,
});
for (let countryName in compiledCities_json_1.default) {
    for (let state in compiledCities_json_1.default[countryName].states) {
        for (let idx in compiledCities_json_1.default[countryName].states[state]) {
            const toSave = {
                city: compiledCities_json_1.default[countryName].states[state][idx],
                state: state,
                country: compiledCities_json_1.default[countryName],
            };
            const key = compiledCities_json_1.default[countryName].states[state][idx].name;
            trie.map(key, toSave);
        }
    }
}
const compCities = {
    getAll: () => { return compiledCities_json_1.default; },
    getCountriesShort: () => {
        const res = [];
        for (const key in compiledCities_json_1.default) {
            res.push(key);
        }
        return res;
    },
    getCountryByShort: (shortName) => {
        if (typeof compiledCities_json_1.default[shortName] !== 'undefined') {
            return compiledCities_json_1.default[shortName];
        }
        else {
            return null;
        }
    },
    getCountryInfoByShort: (shortName) => {
        if (typeof compiledCities_json_1.default[shortName] !== 'undefined') {
            const res = {};
            for (const key in compiledCities_json_1.default[shortName]) {
                if (key !== 'states') {
                    res[key] = compiledCities_json_1.default[shortName][key];
                }
            }
            return res;
        }
        else {
            return null;
        }
    },
    getStatesByShort: (shortName) => {
        if (typeof compiledCities_json_1.default[shortName] !== 'undefined') {
            if (typeof compiledCities_json_1.default[shortName].states !== 'undefined') {
                return Object.keys(compiledCities_json_1.default[shortName].states);
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    },
    getCities: (shortName, state) => {
        if (typeof compiledCities_json_1.default[shortName] !== 'undefined') {
            if (typeof compiledCities_json_1.default[shortName].states !== 'undefined') {
                const res = [];
                for (const idx in compiledCities_json_1.default[shortName].states[state]) {
                    res.push(compiledCities_json_1.default[shortName].states[state][idx].name);
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
    },
    getCountries: () => {
        const res = [];
        for (const shortName in compiledCities_json_1.default) {
            const obj = { shortName };
            for (const key in compiledCities_json_1.default[shortName]) {
                if (key !== 'states') {
                    obj[key] = compiledCities_json_1.default[shortName][key];
                }
            }
            res.push(obj);
        }
        return res;
    },
    getCitiesByName: (name) => {
        return trie.search(name);
    },
};
exports.default = compCities;
