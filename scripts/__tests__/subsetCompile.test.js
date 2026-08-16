'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const { filterIndexes, buildInverted } = require('../compile-postal')
const { pickCountries } = require('../lib/countriesArg')

const FIX = path.join(__dirname, 'fixtures/subset')

describe('subset helpers (maintainer + consumer shared ideas)', () => {
  test('pickCountries from fixture core', () => {
    const db = JSON.parse(
      fs.readFileSync(path.join(FIX, 'core/compiledCities.json'), 'utf8')
    )
    const { picked, missing } = pickCountries(db, ['US', 'ZZ'])
    expect(Object.keys(picked)).toEqual(['US'])
    expect(missing).toEqual(['ZZ'])
  })

  test('filterIndexes for postal', () => {
    const indexes = {
      US: JSON.parse(
        fs.readFileSync(path.join(FIX, 'postal/postal-by-country/US.json'), 'utf8')
      ),
      CA: JSON.parse(
        fs.readFileSync(path.join(FIX, 'postal/postal-by-country/CA.json'), 'utf8')
      ),
    }
    const { indexes: filtered, missing } = filterIndexes(indexes, ['US', 'DE'])
    expect(Object.keys(filtered)).toEqual(['US'])
    expect(missing).toEqual(['DE'])
    const inverted = buildInverted(filtered)
    expect(inverted['90210']).toEqual(['US'])
  })

  test('compile-data subset writes under temp out-dir', () => {
    const { compile } = require('../compile-data')
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ccs-core-subset-'))
    const result = compile({
      countries: ['US', 'CA'],
      outDir: tmp,
    })
    expect(result.subset).toBe(true)
    expect(result.countries).toBe(2)
    const out = JSON.parse(
      fs.readFileSync(path.join(tmp, 'compiledCities.json'), 'utf8')
    )
    expect(Object.keys(out).sort()).toEqual(['CA', 'US'])
    expect(out.DE).toBeUndefined()
  })
})
