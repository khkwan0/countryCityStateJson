export interface City {
  name: string;
  [key: string]: any;
}

export interface State {
  [key: string]: City[];
}

export interface Country {
  states: State;
  [key: string]: any;
}

export interface Database {
  [key: string]: Country;
}

export interface CountryInfo {
  shortName: string;
  [key: string]: any;
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
  getCountryInfoByShort: (shortName: string) => Record<string, any> | null;
  getStatesByShort: (shortName: string) => string[] | null;
  getCities: (shortName: string, state: string) => string[] | null;
  getCountries: () => CountryInfo[];
  getCitiesByName: (name: string) => CitySearchResult[];
}

export default CompCities;