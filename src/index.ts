import db from './lib/compiledCities.json'
import TrieSearch from 'trie-search'
import { CitySearchResult, CountryInfo, Database } from '@/types'

const typedDb = db as Database
const trie = new TrieSearch([],
  {
    min: 2,
    splitOnRegEx: false,
  }
)

for (let countryName in typedDb) {
  for (let state in typedDb[countryName].states) {
    for (let idx in typedDb[countryName].states[state]) {
      const toSave: CitySearchResult = {
        city: typedDb[countryName].states[state][idx],
        state: state,
        country: typedDb[countryName],
      }
      const key = typedDb[countryName].states[state][idx].name
      trie.map(key, toSave)
    }
  }
}

export function getAll() { return typedDb }

export function getCountriesShort() {
    const res: string[] = []
    for (const key in typedDb) {
      res.push(key)
    }
    return res
  }

export function getCountryByShort(shortName: string) {
    if (typeof typedDb[shortName] !== 'undefined') {
      return typedDb[shortName]
    } else {
      return null
    }
  }

export function getCountryInfoByShort(shortName: string) {
    if (typeof typedDb[shortName] !== 'undefined') {
      const res: Record<string, any> = {}
      for (const key in typedDb[shortName]) {
        if (key !== 'states') {
          res[key] = typedDb[shortName][key]
        }
      }
      return res
    } else {
      return null
    }
  }

export function getStatesByShort(shortName: string) {
    if (typeof typedDb[shortName] !== 'undefined') {
      if (typeof typedDb[shortName].states !== 'undefined') {
        return Object.keys(typedDb[shortName].states)
      } else {
        return null
      }
    } else {
      return null
    }
  }

export function getCities(shortName: string, state: string) {
    if (typeof typedDb[shortName] !== 'undefined') {
      if (typeof typedDb[shortName].states !== 'undefined') {
        const res: string[] = []
        for (const idx in typedDb[shortName].states[state]) {
          res.push(typedDb[shortName].states[state][idx].name)
        }
        return res
      } else {
        return null
      }
    } else {
      return null
    }
  }

export function getCountries() {
    const res: CountryInfo[] = []
    for (const shortName in typedDb) {
      const obj: CountryInfo = { shortName }
      for (const key in typedDb[shortName]) {
        if (key !== 'states') {
          obj[key] = typedDb[shortName][key]
        }
      }
      res.push(obj)
    }
    return res
  }

export function getCitiesByName(name: string) {
  return trie.search(name) as CitySearchResult[]
}

export default {
  getAll,
  getCountriesShort,
  getCountryByShort,
  getCountryInfoByShort,
  getStatesByShort,
  getCities,
  getCountries,
  getCitiesByName,
}
