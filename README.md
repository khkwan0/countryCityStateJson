# countrycitystatejson

JSON data for the world's countries, states/provinces, and cities.

[npm](https://www.npmjs.com/package/countrycitystatejson)

## Recent changes

```
2026-08-16 **Feature: filter to a subset of countries** (requires a recompile / subset step — not automatic on `npm i`). Can drastically reduce footprint. See **Filtering to a subset of countries** below.
2026-08-16 Optional postal packages: `countrycitystatejson-postal-us` (~2.5MB) and `countrycitystatejson-postal-world` (~35MB). ZIP lookup is not in the core package. Monthly GeoNames PR refresh; manual 2FA release.
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

### Looking up a city by ZIP / postal code?

**Not in this package.** Install one of the optional companions (pick **one**):

| What you need | Install | Unpacked data (approx.) |
|---|---|---|
| US ZIP codes only | `npm i countrycitystatejson-postal-us` | **~2.5MB** |
| Multi-country postal codes | `npm i countrycitystatejson-postal-world` | **~35MB** |

Core `countrycitystatejson` stays ~2.5MB of cities. Do **not** install `-world` if you only need the US.

```bash
# US only (smaller)
npm i countrycitystatejson-postal-us

# Or worldwide bridged set (much larger)
npm i countrycitystatejson-postal-world
```

```js
// US package
import { getCitiesByPostalCode } from 'countrycitystatejson-postal-us'

const hits = await getCitiesByPostalCode('90210')
// [
//   {
//     city: 'Beverly Hills',
//     state: 'California',
//     countryCode: 'US',
//     postalCode: '90210',
//     bridge: 'exact' // or 'state-only'
//   },
//   ...
// ]

// Optional: filter to one country (still returns an array)
await getCitiesByPostalCode('90210', 'US')
```

```js
// World package — same API; omit country to get every country that shares that postal string
import { getCitiesByPostalCode } from 'countrycitystatejson-postal-world'

const hits = await getCitiesByPostalCode('1000')
// may include US, BE, AT, … — each row has countryCode

await getCitiesByPostalCode('1000', 'BE') // only Belgium rows
```

Always `await` — lookup is async. The return value is always an **array** (every matching city/place; never a single silent pick). Empty array if unknown.

`bridge: 'exact'` = place matched a city in this dataset; `state-only` = state matched but that place name is not in our city list.

**Coverage:** indexes are built from [GeoNames](https://www.geonames.org/) postal dumps (CC BY — please credit) and joined to this package’s country/state/city names. The world package currently includes **~60** countries where that join succeeds — not every GeoNames country. Prefer `-us` when you only need the United States.

Full docs: [`countrycitystatejson-postal-us`](https://www.npmjs.com/package/countrycitystatejson-postal-us) · [`countrycitystatejson-postal-world`](https://www.npmjs.com/package/countrycitystatejson-postal-world)

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

## Filtering to a subset of countries

Published packages ship **full** datasets. Filtering is an explicit **feature**: you must run a subset/recompile step yourself. It is **not** applied automatically when you `npm install`.

Doing so can **drastically reduce** disk and memory footprint (e.g. US-only instead of ~250 countries, or a handful of countries instead of the full ~35MB world postal index).

There are two paths:

| Who | What you run | What you get |
|---|---|---|
| **Consumer** (installed from npm) | `npx ccs-subset` | Filtered **JSON files** you load yourself |
| **Maintainer** (this git repo) | `compile:subset` / `compile:postal:subset` | Recompiled data under `build/subset/` from sources |

Country codes are **ISO 3166-1 alpha-2** (e.g. `US`, `CA`, `DE`). Comma- or space-separated; also `--countries-file=path.txt` (one code per line) on maintainer scripts.

---

### Path A — Consumers (after `npm install`)

Install the full package(s) first, then filter. The CLI ships with `countrycitystatejson` as `ccs-subset`.

#### Core cities only

```bash
npm i countrycitystatejson

npx ccs-subset --countries=US,CA --out=./geo-us-ca
```

Writes:

```
geo-us-ca/
  compiledCities.json              # only US + CA
  compiledCountryAndStates.json    # matching meta (if present in the install)
```

Load it in your app (example):

```js
const cities = require('./geo-us-ca/compiledCities.json')
console.log(Object.keys(cities)) // ['CA', 'US']
console.log(cities.US.states.California)
```

#### Core + postal

```bash
npm i countrycitystatejson countrycitystatejson-postal-us
# or: npm i countrycitystatejson countrycitystatejson-postal-world

npx ccs-subset --countries=US,CA --out=./geo-us-ca --postal=us
# --postal=world  if you installed the world postal package
```

Writes the core JSON above, plus:

```
geo-us-ca/postal/
  postal-by-country/US.json
  postal-by-country/CA.json   # only if that code exists in the postal package
  postal-to-countries.json    # inverted index rebuilt for the subset
```

**Important (consumer path):**

- Requires a **recompile/subset step** (`ccs-subset`); `npm i` alone always gives the full dataset.
- Output is **raw JSON**, not a drop-in replacement npm package (no regenerated `/client` loaders, no `getCitiesByPostalCode` wrapper). Wire the files into your own code, or use Path B for a fuller custom build.
- `--postal=us|world` requires that postal package to be installed; missing country codes are skipped with a warning.
- Unknown core codes are skipped with a warning; if **no** countries match, the command fails.

```bash
npx ccs-subset --help
```

---

### Path B — Maintainers (clone this repository)

Recompile from upstream sources into **`build/subset/`** (gitignored). By default this **does not** overwrite `src/lib/` or `packages/postal-*` (pass `--force-inplace` only if you intend to replace published trees — dangerous).

Prerequisites: `npm install` in the repo root. For postal, either cached GeoNames zips under `.cache/geonames/` or omit `--skip-download` to fetch.

#### Core — recompile a country allowlist

```bash
# From sources → build/subset/core/compiledCities.json (+ country/states meta)
npm run compile:subset -- --countries=US,CA,MX

# Same flags work on the underlying script:
node scripts/compile-data.js --countries=US,CA,MX
node scripts/compile-data.js --countries-file=./my-countries.txt --out-dir=build/subset/core
```

Optional: split client chunks for the subset (does not touch committed `src/client/` loaders):

```bash
npm run split:client -- \
  --in=build/subset/core/compiledCities.json \
  --out-dir=build/subset/core/by-country \
  --loaders-out=build/subset/core/countryLoaders.generated.ts
```

Outputs:

```
build/subset/core/
  compiledCities.json
  compiledCountryAndStates.json
  by-country/US.json          # if you ran split:client
  by-country/CA.json
  countryLoaders.generated.ts
```

Full (non-subset) compile remains:

```bash
npm run compile    # → src/lib/compiledCities.json (all countries)
npm run build
```

#### Postal — recompile a country allowlist

```bash
# From GeoNames + bridge against src/lib/compiledCities.json
# → build/subset/postal/
npm run compile:postal:subset -- --countries=US,CA,DE

# Reuse already-downloaded dumps:
npm run compile:postal:subset -- --countries=US,CA,DE --skip-download

node scripts/compile-postal.js --countries=US --skip-download
# US-only can use US.zip; multi-country uses allCountries.zip then filters
```

Outputs:

```
build/subset/postal/
  postal-by-country/US.json
  postal-by-country/CA.json
  postal-to-countries.json
  DATA_HASH
  loaders.generated.js
```

Full postal packages (published companions) remain:

```bash
npm run compile:postal -- --scope=us       # → packages/postal-us
npm run compile:postal -- --scope=world    # → packages/postal-world
npm run compile:postal                    # both
```

To overwrite a postal package tree with a filtered set (not recommended for normal releases):

```bash
node scripts/compile-postal.js --countries=US,CA --force-inplace --scope=world
```

#### After a maintainer subset compile

1. Point your app or a custom package at `build/subset/core` / `build/subset/postal` JSON.
2. Or copy artifacts into your own publishable package.
3. Do **not** commit `build/subset/` (gitignored). Do **not** use `--force-inplace` unless you mean to change the default published datasets.

---

### Size intuition

| Dataset | Typical full size | Subset example |
|---|---|---|
| Core cities | ~2.5MB (all countries) | Often much smaller with 1–few countries |
| Postal US package | ~2.5MB | Already US-scoped; `ccs-subset` can still drop unused codes if you pass a list |
| Postal world package | ~35MB (~60 bridged countries) | e.g. `US,DE,FR` can be a small fraction of that |

Exact sizes depend on which countries you keep.

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

Country allowlists / subset recompiles: see **[Filtering to a subset of countries](#filtering-to-a-subset-of-countries)** (Path B). Do not overwrite `src/lib/` unless you pass `--force-inplace` on purpose.

`npm run build` includes `fix:modules`, which rewrites `dist/esm` so Node can `import` it (`.js` extensions and JSON import attributes). Do not skip that step, run `tsc` alone, or hand-edit those ESM artifacts. `dist/` is committed — include the rewritten files.

Some country fixes were applied directly to `compiledCities.json`. After `compile`, review the diff (especially `AR`, `IN`, `MX`, `TR`, `ZA`) before committing so curated corrections are not lost.

Convenience functions read from `compiledCities.json`. Please send fixes upstream so everyone gets them.

### Checks

```bash
bash scripts/ci.sh          # install, build, test, import/require smoke (+ postal if data present)
npm run smoke:modules       # CJS require + ESM import against package exports
npm run compile:postal     # download GeoNames + bridge into packages/postal-*
npm run update:postal      # refresh + open/update GitHub PR if data changed
npm run compile:subset -- --countries=US,CA
npm run compile:postal:subset -- --countries=US,CA --skip-download
```

Jenkins and other CI: [docs/CI.md](docs/CI.md).

### Publish

Working tree must be clean. Then:

```bash
npm run release                 # core countrycitystatejson only
npm run release:postal-us        # optional US postal package
npm run release:postal-world     # optional world postal package
```

Core release bumps to `YY.MM.DDnn` (local date; `nn` is the same-day counter from npm plus the current package version), commits `package.json` and `package-lock.json`, pushes the current branch, and runs `npm publish` (which still runs build / test / smoke). You must already be logged in (`npm login`). Postal packages use the same date scheme on their own `package.json` versions.

Postal data refresh (maintainers): `npm run compile:postal` / `npm run update:postal` opens a GitHub PR when GeoNames indexes change; release postal packages manually after merge (2FA). See [docs/CI.md](docs/CI.md) and [`Jenkinsfile.postal`](Jenkinsfile.postal).

## Why this package

Existing country and city datasets did not share a usable state/province link. [`country-state-city`](https://www.npmjs.com/package/country-state-city) used integer IDs, which made corrections painful (the US list had seven bogus states). This package merges [annexare/Countries](https://github.com/annexare/Countries) with that city/state data and keys records by name so a recompile does not need reindexing.

## License

[MIT](LICENSE)
