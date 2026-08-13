"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.getCitiesByName = exports.getCountries = exports.getCities = exports.getStatesByShort = exports.getCountryInfoByShort = exports.getCountryByShort = exports.getCountriesShort = exports.getAll = void 0;
/**
 * Default entry — server-optimized (full sync dataset).
 * For browsers / bundle-sensitive apps, use `countrycitystatejson/client`.
 */
var server_1 = require("./server");
Object.defineProperty(exports, "getAll", { enumerable: true, get: function () { return server_1.getAll; } });
Object.defineProperty(exports, "getCountriesShort", { enumerable: true, get: function () { return server_1.getCountriesShort; } });
Object.defineProperty(exports, "getCountryByShort", { enumerable: true, get: function () { return server_1.getCountryByShort; } });
Object.defineProperty(exports, "getCountryInfoByShort", { enumerable: true, get: function () { return server_1.getCountryInfoByShort; } });
Object.defineProperty(exports, "getStatesByShort", { enumerable: true, get: function () { return server_1.getStatesByShort; } });
Object.defineProperty(exports, "getCities", { enumerable: true, get: function () { return server_1.getCities; } });
Object.defineProperty(exports, "getCountries", { enumerable: true, get: function () { return server_1.getCountries; } });
Object.defineProperty(exports, "getCitiesByName", { enumerable: true, get: function () { return server_1.getCitiesByName; } });
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(server_1).default; } });
