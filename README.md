# countrycitystatejson

JSON formatted data containing the world's countries, states/provinces, and cities.

# Usage
```
const yourhandle= require('countrycitystatejson')
```

## yourhandle.GetAll()
Returns entire DB in JSON format.  ~ 2.5MB

## yourhandle.GetCountriesShort()
Returns an array of Countries' short names:
```
[ 'AD',
  'AE',
  'AF',
  'AG',
  'AI',
  'AL',
    ...
]
```

## yourhandle.GetCountryByShort(shortName)
Returns an object containing country data, as well as an embeded object with the state/province name as the key, wher ethe value is an array of cities.

```
{ name: 'United States',
  native: 'United States',
  phone: '1',
  continent: 'NA',
  capital: 'Washington D.C.',
  currency: 'USD,USN,USS',
  languages: [ 'en' ],
  emoji: '🇺🇸',
  emojiU: 'U+1F1FA U+1F1F8',
  states:
   { Alabama:
      [ [Object],
        [Object],
        [Object],
				...
			]
	 }
}
```

## yourhandle.GetCountryInfoByShort(shortName)
Returns the same object as above except without the states property.

## yourhandle.GetStatesByShort(shortName)
For a given country short name, returns an array of the list of states

## yourhandle.GetCities(shortName, state)
Parameters: Country shortname and the name of the state matching the result of GetStatesByShort.  See Above.  Returns an array of cities belonging to the given state/province.

```
GetCities("US", "Kentucky")
[ 'Albany',
  'Ashland',
  'Bardstown',
  'Berea',
  'Bowling Green',
  'Campbellsville',
  'Catlettsburg',
  'Covington',
  'Crescent Springs',
  ...
]

## What? Why?

In my search for a good database in JSON format that contained Countries and their associated states and cities, I found disparate solutions.  While I found a great database of countries from https://github.com/annexare/Countries and a great database of cities from https://github.com/lutangar/cities.json, I required a linkage between them via states/provinces.  I did indeed found a solution https://www.npmjs.com/package/country-state-city.  However, it did not have rich enough data from the other databases.  In addition, a spot check on that particular database showed errors.  The United States showed 57 states, those 7 extra enrties were also incorrect (e.g. it cotained state entries for the US named: Midland, Seward, Lowa, etc).  Why didn't I just fix it and make a pull request you say?  The issue with that particular database was that the entries were linked together with integer ID's.  So in order to lookup a list of states in a country, you need to use the country id.  This indexing scheme extended down the hierarchy; in order to find the cities of a state, the parameter was a a state id, which stemmed from a country id.  While this indexing scheme is high performant, it made edits and updates to the data somewhat painful.  Any change in or update would require a reindexing of the whole data set.  So in order for me to remove the 7 erroneous US states, extra code would need to be written to reindex.  The solution I present you merges the rich data from https://github.com/annexare/Countries, merges it with https://www.npmjs.com/package/country-state-city and replaces the integer indexing scheme with named keys.  This makes recompiling the final JSON object easier.  Any edits to the underyling raw data can recompile the final json without a need for indexing.  I'm making the assumption that there will be more edits and updates required.  I personally only fixed the 7 erroneous states for country code uS, and have not confirmed any other state/province and city for accuracy.
