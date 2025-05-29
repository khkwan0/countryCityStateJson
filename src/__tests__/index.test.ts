import { getAll, getCitiesByName, getCountries, getCountryByShort, getCountriesShort, getCountryInfoByShort, getStatesByShort, getCities } from '../index';

describe('Country State City JSON', () => {
  describe('getAll', () => {
    it('should return all country data', () => {
      const countries = getAll();
      expect(countries).toBeDefined();
      expect(Object.keys(countries).length).toBeGreaterThan(0);
    });
  });

  describe('getCountriesShort', () => {
    it('should return all country short names', () => {
      const countries = getCountriesShort();
      expect(countries).toBeDefined();
      expect(countries.length).toBeGreaterThan(0);
    });
  });

  describe('getCountryByShort', () => {
    it('should return country data for valid country code', () => {
      const country = getCountryByShort('US');
      expect(country).toBeDefined();
      expect(country?.name).toBe('United States');
    });

    it('should return null for invalid country code', () => {
      const country = getCountryByShort('XX');
      expect(country).toBeNull();
    });
  });

  describe('getCountryInfoByShort', () => {
    it('should return country info for valid country code', () => {
      const country = getCountryInfoByShort('US');
      expect(country).toBeDefined();
      expect(country?.name).toBe('United States');
    });

    it('should return null for invalid country code', () => {
      const country = getCountryInfoByShort('XX');
      expect(country).toBeNull();
    });
  });

  describe('getStatesByShort', () => {
    it('should return state data for valid country code', () => {
      const states = getStatesByShort('US');
      expect(states).toBeDefined();
      expect(states).toContain('California');
    });

    it('should return null for invalid country code', () => {
      const states = getStatesByShort('XX');
      expect(states).toBeNull();
    });
  });

  describe('getCities', () => {
    it('should return city data for valid city code', () => {
      const cities = getCities('US', 'California');
      expect(cities).toBeDefined();
      expect(cities).toContain('Los Angeles');
    });

    it('should return null for invalid state code', () => {
      const cities = getCities('US', 'XX');
      expect(cities).toEqual([]);
    });
  });

  describe('getCountries', () => {
    it('should return all country data', () => {
      const countries = getCountries();
      expect(countries).toBeDefined();
      expect(countries.length).toBeGreaterThan(0);
    });
  });

  describe('getCitiesByName', () => {
    it('should return city data for valid city name', () => {
      const cities = getCitiesByName('Los Angeles');
      expect(cities).toBeDefined();
      expect(cities.length).toBeGreaterThan(0);
    });

    it('should return null for invalid city name', () => {
      const cities = getCitiesByName('XX');
      expect(cities).toEqual([]);
    });
  });
}); 