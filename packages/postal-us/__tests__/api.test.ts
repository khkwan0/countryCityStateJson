import { createPostalApi } from '../../postal-shared/src/createPostalApi'
import type { CountryPostalIndex } from '../../postal-shared/src/types'

describe('createPostalApi', () => {
  const usIndex: CountryPostalIndex = {
    '90210': [['Beverly Hills', 'California', 'exact']],
    '1000': [['Some Place', 'New York', 'state-only']],
  }
  const beIndex: CountryPostalIndex = {
    '1000': [['Bruxelles', 'Brussels', 'exact']],
  }

  const api = createPostalApi({
    countryLoaders: {
      US: async () => usIndex,
      BE: async () => beIndex,
    },
    postalToCountries: {
      '90210': ['US'],
      '1000': ['BE', 'US'],
    },
  })

  afterEach(() => api.clearPostalCache())

  test('returns all combinations when country omitted', async () => {
    const hits = await api.getCitiesByPostalCode('1000')
    expect(hits).toHaveLength(2)
    expect(hits.map((h) => h.countryCode).sort()).toEqual(['BE', 'US'])
  })

  test('filters by country', async () => {
    const hits = await api.getCitiesByPostalCode('1000', 'US')
    expect(hits).toEqual([
      {
        city: 'Some Place',
        state: 'New York',
        countryCode: 'US',
        postalCode: '1000',
        bridge: 'state-only',
      },
    ])
  })

  test('unknown postal returns empty', async () => {
    expect(await api.getCitiesByPostalCode('99999')).toEqual([])
  })

  test('accepts bridge none', async () => {
    const apiNone = createPostalApi({
      countryLoaders: {
        FR: async () => ({
          '10110': [['Bar-sur-Aube', 'Grand Est', 'none']],
        }),
      },
      postalToCountries: { '10110': ['FR'] },
    })
    const hits = await apiNone.getCitiesByPostalCode('10110', 'FR')
    expect(hits[0].bridge).toBe('none')
    expect(hits[0].city).toBe('Bar-sur-Aube')
  })
})
