const cl = require('../countries-list/dist')
const csc = require('../country-state-city')
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
  newlist[key].states = {}
  for (var idx in states) {
    newlist[key].states[states[idx].name] = states[idx]
  }
}
fs.writeFileSync('compiledCountryAndStates.json', JSON.stringify(newlist))
