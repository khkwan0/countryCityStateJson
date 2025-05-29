"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compiledCities_json_1 = require("./lib/compiledCities.json");
var trie_search_1 = require("trie-search");
var trie = new trie_search_1.default([], {
    min: 2,
    splitOnRegEx: false,
});
for (var countryName in compiledCities_json_1.default) {
    for (var state in compiledCities_json_1.default[countryName].states) {
        for (var idx in compiledCities_json_1.default[countryName].states[state]) {
            var toSave = {
                city: compiledCities_json_1.default[countryName].states[state][idx],
                state: state,
                country: compiledCities_json_1.default[countryName],
            };
            var key = compiledCities_json_1.default[countryName].states[state][idx].name;
            trie.map(key, toSave);
        }
    }
}
var compCities = {
    getAll: function () { return compiledCities_json_1.default; },
    getCountriesShort: function () {
        var res = [];
        for (var key in compiledCities_json_1.default) {
            res.push(key);
        }
        return res;
    },
    getCountryByShort: function (shortName) {
        if (typeof compiledCities_json_1.default[shortName] !== 'undefined') {
            return compiledCities_json_1.default[shortName];
        }
        else {
            return null;
        }
    },
    getCountryInfoByShort: function (shortName) {
        if (typeof compiledCities_json_1.default[shortName] !== 'undefined') {
            var res = {};
            for (var key in compiledCities_json_1.default[shortName]) {
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
    getStatesByShort: function (shortName) {
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
    getCities: function (shortName, state) {
        if (typeof compiledCities_json_1.default[shortName] !== 'undefined') {
            if (typeof compiledCities_json_1.default[shortName].states !== 'undefined') {
                var res = [];
                for (var idx in compiledCities_json_1.default[shortName].states[state]) {
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
    getCountries: function () {
        var res = [];
        for (var shortName in compiledCities_json_1.default) {
            var obj = { shortName: shortName };
            for (var key in compiledCities_json_1.default[shortName]) {
                if (key !== 'states') {
                    obj[key] = compiledCities_json_1.default[shortName][key];
                }
            }
            res.push(obj);
        }
        return res;
    },
    getCitiesByName: function (name) {
        return trie.search(name);
    },
};
exports.default = compCities;
