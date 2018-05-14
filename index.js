const db = require('./compiledCities.json')

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
  }
}

module.exports = compCities
