'use strict'

const {
  normalizeName,
  bridgeRow,
  buildInverted,
} = require('../compile-postal')
const { changedScopes, prBody } = require('../update-postal')

describe('normalizeName', () => {
  test('strips accents and punctuation', () => {
    expect(normalizeName('São Paulo')).toBe('sao paulo')
    expect(normalizeName('St. Louis')).toBe('st louis')
  })
})

describe('bridgeRow', () => {
  const lookup = {
    states: new Map([
      [
        'california',
        {
          name: 'California',
          cities: new Map([['beverly hills', 'Beverly Hills']]),
        },
      ],
    ]),
    stateAliases: new Map([
      ['california', 'California'],
      ['ca', 'California'],
    ]),
  }

  test('exact city match', () => {
    expect(bridgeRow(lookup, 'Beverly Hills', 'California', 'CA')).toEqual([
      'Beverly Hills',
      'California',
      'exact',
    ])
  })

  test('state-only when city missing', () => {
    expect(bridgeRow(lookup, 'Unknownville', 'CA', 'CA')).toEqual([
      'Unknownville',
      'California',
      'state-only',
    ])
  })

  test('null when state unknown', () => {
    expect(bridgeRow(lookup, 'X', 'ZZ', 'ZZ')).toBeNull()
  })
})

describe('buildInverted', () => {
  test('maps postal to all countries', () => {
    const inverted = buildInverted({
      US: { 1000: [['A', 'B', 'exact']] },
      BE: { 1000: [['C', 'D', 'state-only']] },
      AT: { 2000: [['E', 'F', 'exact']] },
    })
    expect(inverted['1000']).toEqual(['BE', 'US'])
    expect(inverted['2000']).toEqual(['AT'])
  })
})

describe('changedScopes / prBody', () => {
  test('detects hash changes', () => {
    expect(
      changedScopes({ us: 'a', world: 'b' }, { us: 'a', world: 'c' })
    ).toEqual(['world'])
  })

  test('prBody lists release commands', () => {
    const body = prBody(['us'])
    expect(body).toContain('npm run release:postal-us')
    expect(body).not.toContain('npm run release:postal-world')
  })
})
