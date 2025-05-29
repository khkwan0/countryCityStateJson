var _a = require('../../dist/cjs/index.js'), getAll = _a.getAll, getCitiesByName = _a.getCitiesByName, getCountries = _a.getCountries, getCountryByShort = _a.getCountryByShort, getCountriesShort = _a.getCountriesShort, getCountryInfoByShort = _a.getCountryInfoByShort, getStatesByShort = _a.getStatesByShort, getCities = _a.getCities;
describe('Country State City JSON', function () {
    describe('getAll', function () {
        it('should return all country data', function () {
            var countries = getAll();
            expect(countries).toBeDefined();
            expect(Object.keys(countries).length).toBeGreaterThan(0);
        });
    });
    describe('getCountriesShort', function () {
        it('should return all country short names', function () {
            var countries = getCountriesShort();
            expect(countries).toBeDefined();
            expect(countries.length).toBeGreaterThan(0);
        });
    });
    describe('getCountryByShort', function () {
        it('should return country data for valid country code', function () {
            var country = getCountryByShort('US');
            expect(country).toBeDefined();
            expect(country === null || country === void 0 ? void 0 : country.name).toBe('United States');
        });
        it('should return null for invalid country code', function () {
            var country = getCountryByShort('XX');
            expect(country).toBeNull();
        });
    });
    describe('getCountryInfoByShort', function () {
        it('should return country info for valid country code', function () {
            var country = getCountryInfoByShort('US');
            expect(country).toBeDefined();
            expect(country === null || country === void 0 ? void 0 : country.name).toBe('United States');
        });
        it('should return null for invalid country code', function () {
            var country = getCountryInfoByShort('XX');
            expect(country).toBeNull();
        });
    });
    describe('getStatesByShort', function () {
        it('should return state data for valid country code', function () {
            var states = getStatesByShort('US');
            expect(states).toBeDefined();
            expect(states).toContain('California');
        });
        it('should return null for invalid country code', function () {
            var states = getStatesByShort('XX');
            expect(states).toBeNull();
        });
    });
    describe('getCities', function () {
        it('should return city data for valid city code', function () {
            var cities = getCities('US', 'California');
            expect(cities).toBeDefined();
            expect(cities).toContain('Los Angeles');
        });
        it('should return null for invalid state code', function () {
            var cities = getCities('US', 'XX');
            expect(cities).toEqual([]);
        });
    });
    describe('getCountries', function () {
        it('should return all country data', function () {
            var countries = getCountries();
            expect(countries).toBeDefined();
            expect(countries.length).toBeGreaterThan(0);
        });
    });
    describe('getCitiesByName', function () {
        it('should return city data for valid city name', function () {
            var cities = getCitiesByName('Los Angeles');
            expect(cities).toBeDefined();
            expect(cities.length).toBeGreaterThan(0);
        });
        it('should return null for invalid city name', function () {
            var cities = getCitiesByName('XX');
            expect(cities).toEqual([]);
        });
    });
});
