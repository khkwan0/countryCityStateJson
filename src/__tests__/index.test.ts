import {
  getAll,
  getCitiesByName,
  getCountries,
  getCountryByShort,
  getCountriesShort,
  getCountryInfoByShort,
  getStatesByShort,
  getCities,
} from '../index'
import {
  getAll as getAllLight,
  getCountriesShort as getCountriesShortLight,
  getStatesByShort as getStatesByShortLight,
  getCountryByShort as getCountryByShortLight,
} from '../countries'

describe('Country State City JSON', () => {
  describe('getAll', () => {
    it('should return all country data', () => {
      const countries = getAll()
      expect(countries).toBeDefined()
      expect(Object.keys(countries).length).toBeGreaterThan(200)
    })
  })

  describe('getCountriesShort', () => {
    it('should return all country short names', () => {
      const countries = getCountriesShort()
      expect(countries).toBeDefined()
      expect(countries.length).toBeGreaterThan(200)
      expect(countries).toContain('US')
    })
  })

  describe('getCountryByShort', () => {
    it('should return country data for valid country code', () => {
      const country = getCountryByShort('US')
      expect(country).toBeDefined()
      expect(country?.name).toBe('United States')
      expect(country?.states?.California).toBeDefined()
    })

    it('should return null for invalid country code', () => {
      const country = getCountryByShort('XX')
      expect(country).toBeNull()
    })
  })

  describe('getCountryInfoByShort', () => {
    it('should return country info for valid country code', () => {
      const country = getCountryInfoByShort('US')
      expect(country).toBeDefined()
      expect(country?.name).toBe('United States')
      expect(country?.shortName).toBe('US')
      expect((country as { states?: unknown }).states).toBeUndefined()
    })

    it('should return null for invalid country code', () => {
      const country = getCountryInfoByShort('XX')
      expect(country).toBeNull()
    })
  })

  describe('getStatesByShort', () => {
    it('should return state data for valid country code', () => {
      const states = getStatesByShort('US')
      expect(states).toBeDefined()
      expect(states).toContain('California')
      expect(states).not.toContain('Midland')
      expect(states).not.toContain('Seward')
      expect(states).not.toContain('Lowa')
    })

    it('should return null for invalid country code', () => {
      const states = getStatesByShort('XX')
      expect(states).toBeNull()
    })
  })

  describe('getCities', () => {
    it('should return city data for valid city code', () => {
      const cities = getCities('US', 'California')
      expect(cities).toBeDefined()
      expect(cities).toContain('Los Angeles')
    })

    it('should return empty array for invalid state code', () => {
      const cities = getCities('US', 'XX')
      expect(cities).toEqual([])
    })

    it('should return null for invalid country code', () => {
      const cities = getCities('XX', 'California')
      expect(cities).toBeNull()
    })
  })

  describe('getCountries', () => {
    it('should return all country data', () => {
      const countries = getCountries()
      expect(countries).toBeDefined()
      expect(countries.length).toBeGreaterThan(200)
      expect(countries.some((c) => c.shortName === 'US' && c.name === 'United States')).toBe(true)
    })
  })

  describe('getCitiesByName', () => {
    it('should return city data for valid city name', () => {
      const cities = getCitiesByName('Los Angeles')
      expect(cities).toBeDefined()
      expect(cities.length).toBeGreaterThan(0)
      expect(cities[0].city.name).toMatch(/Los Angeles/i)
    })

    it('should return empty array for invalid city name', () => {
      const cities = getCitiesByName('XX')
      expect(cities).toEqual([])
    })
  })
})

describe('Lightweight countries entry', () => {
  it('exposes countries without embedding city arrays', () => {
    const countries = getCountriesShortLight()
    expect(countries.length).toBeGreaterThan(200)

    const us = getCountryByShortLight('US')
    expect(us?.name).toBe('United States')
    expect(us?.states?.California?.name).toBe('California')
    expect(Array.isArray(us?.states?.California)).toBe(false)

    const states = getStatesByShortLight('US')
    expect(states).toContain('California')

    const all = getAllLight()
    expect(Object.keys(all).length).toBe(countries.length)
  })
})

describe('Data integrity', () => {
  it('keeps critical country records shaped correctly', () => {
    for (const code of ['US', 'CA', 'GB', 'AU', 'IN', 'MX', 'TR', 'AR', 'NG']) {
      const country = getCountryByShort(code)
      expect(country).toBeTruthy()
      expect(country?.name).toBeTruthy()
      expect(country?.states).toBeTruthy()
      expect(Object.keys(country!.states).length).toBeGreaterThan(0)
    }
  })
})
