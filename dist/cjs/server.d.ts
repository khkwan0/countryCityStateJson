import type { CitySearchResult, CompCities, Country, CountryInfo, Database } from './types';
export declare function getAll(): Database;
export declare function getCountriesShort(): string[];
export declare function getCountryByShort(shortName: string): Country | null;
export declare function getCountryInfoByShort(shortName: string): CountryInfo | null;
export declare function getStatesByShort(shortName: string): string[] | null;
export declare function getCities(shortName: string, state: string): string[] | null;
export declare function getCountries(): CountryInfo[];
export declare function getCitiesByName(name: string): CitySearchResult[];
declare const api: CompCities;
export default api;
//# sourceMappingURL=server.d.ts.map