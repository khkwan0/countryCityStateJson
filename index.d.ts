interface City {
  name: string;
  [key: string]: any; // For any additional city properties
}

interface Country {
  states: {
    [stateName: string]: City[];
  };
  [key: string]: any; // For any additional country properties
}

interface CountryInfo {
  shortName: string;
  [key: string]: any; // For any additional country info properties
}

interface CompiledCities {
  getAll(): { [countryName: string]: Country };
  getCountriesShort(): string[];
  getCountryByShort(shortName: string): Country | null;
  getCountryInfoByShort(shortName: string): CountryInfo | null;
  getStatesByShort(shortName: string): string[] | null;
  getCities(shortName: string, state: string): string[] | null;
  getCountries(): CountryInfo[];
  getCitiesByName(name: string): Array<{
    city: City;
    state: string;
    country: Country;
  }>;
}

declare const compCities: CompiledCities;
export = compCities; 