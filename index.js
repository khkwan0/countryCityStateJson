const db = require('./compiledCities.json')

var compCities = {

  GetAll: () => { return db },
  GetCountriesShort: () => {
    let res = []
    for (var key in db) {
      res.push(key)
    }
    return res
  }
}

module.exports = compCities
