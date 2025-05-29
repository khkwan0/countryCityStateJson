const cl = require('../src/countries-list')
const csc = require('../src/country-state-city')
const fs = require('fs')

let newlist = {}

cscCountries = csc.getAllCountries()

newlist = cl.countries
for (var key in newlist) {
  console.log(key)
  let i = 0;
  found = false;
  let cscCountryId = null
  while (!found && i < cscCountries.length) {
    if (cscCountries[i].sortname === key) {
      found = true
      cscCountryId = cscCountries[i].id
    }
    i++
  }
  let states = csc.getStatesOfCountry(cscCountryId)
  let cities = null
  newlist[key].states = {}
  for (var idx in states) {
    cities = csc.getCitiesOfState(states[idx].id)
    newlist[key].states[states[idx].name] = cities
  }
}
fs.writeFileSync('compiledCities.json', JSON.stringify(newlist))
