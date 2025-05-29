const db = require('./lib/compiledCities.json')
const TrieSearch = require('trie-search')

const trie = new TrieSearch([],
  {
    min: 2,
    splitOnRegEx: false,
  }
)


for (let countryName in db) {
  for (let state in db[countryName].states) {
    for (let idx in db[countryName].states[state]) {
      const toSave = {
        city: db[countryName].states[state][idx],
        state: state,
        country: db[countryName],
      }
//      const key = db[countryName].states[state][idx].name.toLowerCase().replace(/\s/g,'')
      const key = db[countryName].states[state][idx].name
      trie.map(key, toSave)
    }
  }
}

var compCities = {

  getAll: () => { return db },
  getCountriesShort: () => {
    let res = []
    for (var key in db) {
      res.push(key)
    }
    return res
  },
  getCountryByShort: (shortName) => {
    if (typeof db[shortName] !== 'undefined') {
      return db[shortName]
    } else {
      return null
    }
  },
  getCountryInfoByShort: (shortName) => {
    if (typeof db[shortName] !== 'undefined') {
      let res = {}
      for (var key in db[shortName]) {
        if (key !== 'states') {
          res[key] = db[shortName][key]
        }
      }
      return res
    } else {
      return null
    }
  },
  getStatesByShort: (shortName) => {
    if (typeof db[shortName] !== 'undefined') {
      let res = []
      if (typeof db[shortName].states !== 'undefined') {
        res = Object.keys(db[shortName].states)
        return res
      } else {
        return null
      }
    } else {
      return null
    }
  },
  getCities: (shortName, state) => {
    if (typeof db[shortName] !== 'undefined') {
      if (typeof db[shortName].states != 'undefined') {
        let res=[]
        for (let idx in  db[shortName].states[state]) {
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
    let res = []
    for (var shortName in db) {
      let obj = {}
      for (var key in db[shortName]) {
        if (key !== 'states') {
          obj.shortName = shortName
          obj[key] = db[shortName][key]
        }
      }
      res.push(obj)
    }
    return res
  },
  getCitiesByName: name => {
    const res = trie.search(name)
    return res
  },
}

module.exports = compCities
