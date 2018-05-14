const db = require('./lib/compiledCities.json')

var compCities = {

  GetAll: () => { return db },
  GetCountriesShort: () => {
    let res = []
    for (var key in db) {
      res.push(key)
    }
    return res
  },
  GetCountryByShort: (shortName) => {
    if (typeof db[shortName] !== 'undefined') {
      return db[shortName]
    } else {
      return null
    }
  },
  GetCountryInfoByShort: (shortName) => {
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
  GetStatesByShort: (shortName) => {
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
  }
}

module.exports = compCities
