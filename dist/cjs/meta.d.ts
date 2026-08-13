import type { CountryInfo, CountryStateDatabase, CountryWithStateMeta } from './types';
export declare function getAll(): CountryStateDatabase;
export declare function getCountriesShort(): string[];
export declare function getCountryByShort(shortName: string): CountryWithStateMeta | null;
export declare function getCountryInfoByShort(shortName: string): CountryInfo | null;
export declare function getStatesByShort(shortName: string): string[] | null;
export declare function getCountries(): CountryInfo[];
declare const _default: {
    getAll: typeof getAll;
    getCountriesShort: typeof getCountriesShort;
    getCountryByShort: typeof getCountryByShort;
    getCountryInfoByShort: typeof getCountryInfoByShort;
    getStatesByShort: typeof getStatesByShort;
    getCountries: typeof getCountries;
};
export default _default;
//# sourceMappingURL=meta.d.ts.map