# countrycitystatejson

JSON data for the world's countries, states/provinces, and cities.

[npm](https://www.npmjs.com/package/countrycitystatejson)

## Recent changes

```
2026-08-16 Switched the package license to MIT.
2026-08-16 Dual CJS/ESM: `import` and `require` both work. `npm run release` date-bumps, commits, pushes, and publishes.
2026-04-04 Merged fixes to Tucuman province, Argentina.  (Thanks to gerohelguera)
2025-08-01 Fixed errnoneous states for India, South Africa, and Mexico.  Added correct cities for Ciudad de Mexico
2025-05-29 Added typescript definitions
2024-12-29 Fixes to Turkey (Had extra states that don't belong - Thanks Sinan997)
2023-03-27 Fixes to Maldives
2023-02-15 More fixes to Australian cities. (Thanks again andrewjdavidson)
2022-10-21 Fixed some Australian city and state information.  (Thanks andrewjdavidson)
2021-10-14 Some optimizations
2021-10-13 Added getCitiesByName method.
More accurate Nigerian states and cities.  (Thanks TheoOkafor)
```

## Usage

ESM `import` and CJS `require` expose the same API (named exports and a default object). Native Node `import` needs **Node 20.10+**; `require` works on Node 18+.

```js
import geo, { getCities } from 'countrycitystatejson'
// or: import geo from 'countrycitystatejson/server'
getCities('US', 'California')

const geoCjs = require('countrycitystatejson')
geoCjs.getCities('US', 'California')

// Client / bundlers — metadata is sync; cities lazy-load per country
import geoClient from 'countrycitystatejson/client'
await geoClient.getCities('US', 'California')
await geoClient.getCitiesByName('Los Angeles', 'US')

// Countries + states only, no city payloads (~300KB)
import countriesOnly from 'countrycitystatejson/countries'
```

The package has three entrypoints. The **import path** is which one you load (`import … from '…'` or `require('…')`):

| Import path | What it is | Best for | Cities | API |
|---|---|---|---|---|
| `countrycitystatejson` or `countrycitystatejson/server` | Default/full server build. Same API; loads the whole city database into memory. | Node, SSR, backends | Full in-memory DB (~2.5MB) | Sync |
| `countrycitystatejson/client` | Browser/bundler build. Country/state metadata is small and sync; cities load one country at a time. | Browsers, bundle-sensitive apps | Lazy per-country chunks | Sync metadata + async cities (`await getCities(…)`) |
| `countrycitystatejson/countries` | Metadata only: countries + state names, no city lists. | Dropdowns / forms without cities | None (~300KB) | Sync |

TypeScript types ship with both builds (`dist/cjs`, `dist/esm`).

### `getAll()`

Full database (~2.5MB).

### `getCountries()`

Every country plus `shortName` (no states/cities):

```
{ shortName: 'HK', name: 'Hong Kong', native: '香港', phone: '852',
  continent: 'AS', capital: 'City of Victoria', currency: 'HKD',
  languages: [ 'zh', 'en' ], emoji: '🇭🇰', emojiU: 'U+1F1ED U+1F1F0' }
```

### `getCountriesShort()`

```
[ 'AD', 'AE', 'AF', 'AG', 'AI', 'AL', ... ]
```

### `getCountryByShort(shortName)`

Country record with `states` keyed by state name; each value is an array of cities.

```
getCountryByShort('US')
// { name: 'United States', ..., states: { Alabama: [ [Object], ... ], ... } }
```

### `getCountryInfoByShort(shortName)`

Same as above without `states`.

### `getStatesByShort(shortName)`

State/province names for that country, or `null` if the code is unknown.

### `getCities(shortName, state)`

City names for a country + state (state name from `getStatesByShort`). Unknown country → `null`; unknown state → `[]`.

```
getCities('US', 'Kentucky')
// [ 'Albany', 'Ashland', 'Bardstown', ... ]
```

### `getCitiesByName(cityName)`

Prefix search across the full dataset (not cheap on the server entry). Client API requires a country code: `getCitiesByName(name, shortName)`.

```
getCitiesByName('lexington')
// [ { city: { id, name }, state, country }, ... ]
```

## Developing

Do not add `"type": "module"` to the **root** `package.json` — that would break Jest, `scripts/*.js`, and root `index.js`. ESM is marked only in `dist/esm/package.json`.

In-repo tests import from `src/` via Jest. That is not the same as a consumer `import` from `'countrycitystatejson'`.

### Data edits

Sources live under `src/`:

- Country metadata: `src/countries-list/dist/countries.json`
- Cities/states: `src/country-state-city/lib/city.json` and `state.json` (cities join states by `id`)

Then:

```bash
npm run compile   # writes src/lib/compiledCities.json (+ states-only + compat copy)
npm run build     # CJS + ESM entrypoints, client chunks, ESM rewrite for Node import
npm test
```

`npm run build` includes `fix:modules`, which rewrites `dist/esm` so Node can `import` it (`.js` extensions and JSON import attributes). Do not skip that step, run `tsc` alone, or hand-edit those ESM artifacts. `dist/` is committed — include the rewritten files.

Some country fixes were applied directly to `compiledCities.json`. After `compile`, review the diff (especially `AR`, `IN`, `MX`, `TR`, `ZA`) before committing so curated corrections are not lost.

Convenience functions read from `compiledCities.json`. Please send fixes upstream so everyone gets them.

### Checks

```bash
bash scripts/ci.sh          # install, build, test, import/require smoke
npm run smoke:modules       # CJS require + ESM import against package exports
```

Jenkins and other CI: [docs/CI.md](docs/CI.md).

### Publish

Working tree must be clean. Then:

```bash
npm run release
```

That bumps the version to `YY.MM.DDnn` (local date; `nn` is the same-day counter from npm plus the current package version), commits `package.json` and `package-lock.json`, pushes the current branch, and runs `npm publish` (which still runs build / test / smoke). You must already be logged in (`npm login`).

## Why this package

Existing country and city datasets did not share a usable state/province link. [`country-state-city`](https://www.npmjs.com/package/country-state-city) used integer IDs, which made corrections painful (the US list had seven bogus states). This package merges [annexare/Countries](https://github.com/annexare/Countries) with that city/state data and keys records by name so a recompile does not need reindexing.

## License

[MIT](LICENSE)
