"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compiledCities_json_1 = __importDefault(require("../lib/compiledCities.json"));
const trie_search_1 = __importDefault(require("trie-search"));
const typedDb = compiledCities_json_1.default;
const trie = new trie_search_1.default([], {
    min: 2,
    splitOnRegEx: false,
});
for (let countryName in typedDb) {
    for (let state in typedDb[countryName].states) {
        for (let idx in typedDb[countryName].states[state]) {
            const toSave = {
                city: typedDb[countryName].states[state][idx],
                state: state,
                country: typedDb[countryName],
            };
            const key = typedDb[countryName].states[state][idx].name;
            trie.map(key, toSave);
        }
    }
}
const compCities = {
    getAll: () => { return typedDb; },
    getCountriesShort: () => {
        const res = [];
        for (const key in typedDb) {
            res.push(key);
        }
        return res;
    },
    getCountryByShort: (shortName) => {
        if (typeof typedDb[shortName] !== 'undefined') {
            return typedDb[shortName];
        }
        else {
            return null;
        }
    },
    getCountryInfoByShort: (shortName) => {
        if (typeof typedDb[shortName] !== 'undefined') {
            const res = {};
            for (const key in typedDb[shortName]) {
                if (key !== 'states') {
                    res[key] = typedDb[shortName][key];
                }
            }
            return res;
        }
        else {
            return null;
        }
    },
    getStatesByShort: (shortName) => {
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
    },
    getCities: (shortName, state) => {
        if (typeof typedDb[shortName] !== 'undefined') {
            if (typeof typedDb[shortName].states !== 'undefined') {
                const res = [];
                for (const idx in typedDb[shortName].states[state]) {
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
    },
    getCountries: () => {
        const res = [];
        for (const shortName in typedDb) {
            const obj = { shortName };
            for (const key in typedDb[shortName]) {
                if (key !== 'states') {
                    obj[key] = typedDb[shortName][key];
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
