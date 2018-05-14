const db = require('./lib/compiledCities.json')

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
  }
}

module.exports = compCities
