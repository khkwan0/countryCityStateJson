# countrycitystatejson

JSON formatted data containing the world's countries, states/provinces, and cities.

#NPM
https://www.npmjs.com/package/countrycitystatejson

#Recent Changes
More accurate Nigerian states and cities.  (Thanks TheoOkafor)

# Usage
```
const yourhandle= require('countrycitystatejson')
```

## yourhandle.getAll()
Returns entire DB in JSON format.  ~ 2.5MB

## yourhandle.getCountries()
Returns all countries with their associated information as well as their short name (Country abbreviation)

```
[
...
	{ shortName: 'HK',
    name: 'Hong Kong',
    native: '香港',
    phone: '852',
    continent: 'AS',
    capital: 'City of Victoria',
    currency: 'HKD',
    languages: [ 'zh', 'en' ],
    emoji: '🇭🇰',
    emojiU: 'U+1F1ED U+1F1F0' },
  { shortName: 'HM',
    name: 'Heard Island and McDonald Islands',
    native: 'Heard Island and McDonald Islands',
    phone: '61',
    continent: 'AN',
    capital: '',
    currency: 'AUD',
    languages: [ 'en' ],
    emoji: '🇭🇲',
    emojiU: 'U+1F1ED U+1F1F2' },
  { shortName: 'HN',
    name: 'Honduras',
    native: 'Honduras',
    phone: '504',
    continent: 'NA',
    capital: 'Tegucigalpa',
    currency: 'HNL',
    languages: [ 'es' ],
    emoji: '🇭🇳',
    emojiU: 'U+1F1ED U+1F1F3' },
	...
]
```

## yourhandle.getCountriesShort()
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

## yourhandle.getCountryByShort(shortName)
Returns an object containing country data, as well as an embedded object with the state/province name as the key, where the value is an array of cities.

```
yourhandle.getCountryByShort('US')

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

## yourhandle.getCountryInfoByShort(shortName)
Returns the same object as above except without the states property.

## yourhandle.getStatesByShort(shortName)
For a given country short name, returns an array of the list of states

## yourhandle.getCities(shortName, state)
Parameters: Country short name and the name of the state matching the result of GetStatesByShort.  See Above.  Returns an array of cities belonging to the given state/province.

```
yourhandle.getCities('US','Kentucky')

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
```
# Editing and adding data to origin sources
Found an error, missing data?  No problem.  The original data set was pulled from other npm packages.  They are indeed not 100% complete and not 100% error free.

The data sources have been included in the './src' folder.  For example, if you need to edit country information, you will want to edit `./src/countries-list/dist/countries.json`.

For cities and states, you will want to edit `./src/country-state-city/lib/city.json` or `state.json`.  Notice that in state.json there is a id element.  That "id" element is indexed in city.json to form a relationship.  So if you want to add a city and connect it the state, find, the state in state.json, get the "id" value and set that as the state id in the city.json file.

Editing or updating the sources will require a recompile.  The recompile script is under lib.  Just run
```bash
$ node compilecountries.js
```

and it will write out to `compiledCities.json` (hardcoded file name).

compiledCities.json is where the convencience functions (see above) read from.

I hope this is clear so that any edits, fixes, and changes can be easily and quickly done by everyone.  Please, if you do have a fix, be sure to submit it, so we can share the fix with everyone.

# What? Why?

In my search for a good database in JSON format that contained Countries and their associated states and cities, I found disparate solutions.  

While I found a great database of countries from https://github.com/annexare/Countries and a great database of cities from https://github.com/lutangar/cities.json, I required a linkage between them via states/provinces.  I did indeed found a solution https://www.npmjs.com/package/country-state-city.  However, it did not have rich enough data from the other databases.  In addition, a spot check on that particular database showed errors.  The United States showed 57 states, those 7 extra entries were also incorrect (e.g. it contained state entries for the US named: Midland, Seward, Lowa, etc).  

Why didn't I just fix it and make a pull request you say?  The issue with that particular database was that the entries were linked together with integer ID's.  So in order to lookup a list of states in a country, you need to use the country id.  This indexing scheme extended down the hierarchy; in order to find the cities of a state, the parameter was a a state id, which stemmed from a country id.  While this indexing scheme is high performant, it made edits and updates (due to errors I found) to the data somewhat painful.  Any change in or update would require a reindexing of the whole data set.  

So in order for me to remove the 7 erroneous US states, extra code would need to be written to reindex.  The solution I present you merges the rich data from https://github.com/annexare/Countries, merges it with https://www.npmjs.com/package/country-state-city and replaces the integer indexing scheme with named keys.

This makes recompiling the final JSON object easier.  Any edits to the underyling raw data can recompile the final json without a need for indexing.  I'm making the assumption that there will be more edits and updates required.  I personally only fixed the 7 erroneous states for country code US, and have not confirmed any other state/province and city for accuracy.  In addition, removing the integer id indexing and replacing it with named indeces should not have a performance hit if you are using the V8 engine.
