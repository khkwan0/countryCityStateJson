export interface City {
    id?: string;
    name: string;
    state_id?: string;
}
export interface StateMeta {
    id?: string;
    name: string;
    country_id?: string;
}
export interface CountryBase {
    name: string;
    native: string;
    phone: string;
    continent: string;
    capital: string;
    currency: string;
    languages: string[];
    emoji: string;
    emojiU: string;
}
export interface Country extends CountryBase {
    states: Record<string, City[]>;
}
export interface CountryWithStateMeta extends CountryBase {
    states: Record<string, StateMeta>;
}
export type Database = Record<string, Country>;
export type CountryStateDatabase = Record<string, CountryWithStateMeta>;
export interface CountryInfo extends Partial<CountryBase> {
    shortName: string;
}
export interface CitySearchResult {
    city: City;
    state: string;
    country: Country;
}
export interface CompCities {
    getAll: () => Database;
    getCountriesShort: () => string[];
    getCountryByShort: (shortName: string) => Country | null;
    getCountryInfoByShort: (shortName: string) => CountryInfo | null;
    getStatesByShort: (shortName: string) => string[] | null;
    getCities: (shortName: string, state: string) => string[] | null;
    getCountries: () => CountryInfo[];
    getCitiesByName: (name: string) => CitySearchResult[];
}
export default CompCities;
//# sourceMappingURL=index.d.ts.map