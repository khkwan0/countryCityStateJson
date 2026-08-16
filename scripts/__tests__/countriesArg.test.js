'use strict'

const {
  parseCountriesArgv,
  parseCountriesList,
  pickCountries,
} = require('../lib/countriesArg')

describe('countriesArg', () => {
  test('parses --countries=', () => {
    const { codes } = parseCountriesArgv(['--countries=us,ca,GB'])
    expect(codes).toEqual(['CA', 'GB', 'US'])
  })

  test('parses --countries separate arg', () => {
    const { codes, rest } = parseCountriesArgv([
      '--countries',
      'US, MX',
      '--skip-download',
    ])
    expect(codes).toEqual(['MX', 'US'])
    expect(rest).toEqual(['--skip-download'])
  })

  test('rejects invalid codes', () => {
    expect(() => parseCountriesList('USA')).toThrow(/Invalid country code/)
  })

  test('pickCountries reports missing', () => {
    const { picked, missing } = pickCountries({ US: 1, CA: 2 }, ['US', 'ZZ'])
    expect(picked).toEqual({ US: 1 })
    expect(missing).toEqual(['ZZ'])
  })

  test('force-inplace and out-dir', () => {
    const opts = parseCountriesArgv([
      '--countries=US',
      '--force-inplace',
      '--out-dir=build/x',
    ])
    expect(opts.forceInplace).toBe(true)
    expect(opts.outDir).toBe('build/x')
  })
})
