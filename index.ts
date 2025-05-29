import db from './lib/compiledCities.json'
import TrieSearch from 'trie-search'
import type { CitySearchResult, CompCities, CountryInfo } from './index.d'

const trie = new TrieSearch([],
  {
    min: 2,
    splitOnRegEx: false,
  }
)

for (let countryName in db) {
  for (let state in db[countryName].states) {
    for (let idx in db[countryName].states[state]) {
      const toSave: CitySearchResult = {
        city: db[countryName].states[state][idx],
        state: state,
        country: db[countryName],
      }
      const key = db[countryName].states[state][idx].name
      trie.map(key, toSave)
    }
  }
}

const compCities: CompCities = {
  getAll: () => { return db },
  getCountriesShort: () => {
    const res: string[] = []
    for (const key in db) {
      res.push(key)
    }
    return res
  },
  getCountryByShort: (shortName: string) => {
    if (typeof db[shortName] !== 'undefined') {
      return db[shortName]
    } else {
      return null
    }
  },
  getCountryInfoByShort: (shortName: string) => {
    if (typeof db[shortName] !== 'undefined') {
      const res: Record<string, any> = {}
      for (const key in db[shortName]) {
        if (key !== 'states') {
          res[key] = db[shortName][key]
        }
      }
      return res
    } else {
      return null
    }
  },
  getStatesByShort: (shortName: string) => {
    if (typeof db[shortName] !== 'undefined') {
      if (typeof db[shortName].states !== 'undefined') {
        return Object.keys(db[shortName].states)
      } else {
        return null
      }
    } else {
      return null
    }
  },
  getCities: (shortName: string, state: string) => {
    if (typeof db[shortName] !== 'undefined') {
      if (typeof db[shortName].states !== 'undefined') {
        const res: string[] = []
        for (const idx in db[shortName].states[state]) {
          res.push(db[shortName].states[state][idx].name)
        }
        return res
      } else {
        return null
      }
    } else {
      return null
    }
  },
  getCountries: () => {
    const res: CountryInfo[] = []
    for (const shortName in db) {
      const obj: CountryInfo = { shortName }
      for (const key in db[shortName]) {
        if (key !== 'states') {
          obj[key] = db[shortName][key]
        }
      }
      res.push(obj)
    }
    return res
  },
  getCitiesByName: (name: string) => {
    return trie.search(name)
  },
}

export default compCities
