"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.getCountries = exports.getStatesByShort = exports.getCountryInfoByShort = exports.getCountryByShort = exports.getCountriesShort = exports.getAll = void 0;
/**
 * Lightweight sync entry: country metadata + state names/ids only (no city lists).
 * Import via `countrycitystatejson/countries`.
 */
var meta_1 = require("./meta");
Object.defineProperty(exports, "getAll", { enumerable: true, get: function () { return meta_1.getAll; } });
Object.defineProperty(exports, "getCountriesShort", { enumerable: true, get: function () { return meta_1.getCountriesShort; } });
Object.defineProperty(exports, "getCountryByShort", { enumerable: true, get: function () { return meta_1.getCountryByShort; } });
Object.defineProperty(exports, "getCountryInfoByShort", { enumerable: true, get: function () { return meta_1.getCountryInfoByShort; } });
Object.defineProperty(exports, "getStatesByShort", { enumerable: true, get: function () { return meta_1.getStatesByShort; } });
Object.defineProperty(exports, "getCountries", { enumerable: true, get: function () { return meta_1.getCountries; } });
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(meta_1).default; } });
