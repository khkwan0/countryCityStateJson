# countrycitystatejson-postal-us

US ZIP code → city/state lookup, bridged onto [countrycitystatejson](https://www.npmjs.com/package/countrycitystatejson) names.

Postal source: [GeoNames](https://www.geonames.org/) postal codes ([CC BY](https://creativecommons.org/licenses/by/4.0/)). Please credit GeoNames.

## Install

```bash
npm i countrycitystatejson-postal-us
```

## Usage

```js
import postal, { getCitiesByPostalCode } from 'countrycitystatejson-postal-us'

// All matches for this ZIP in the US package scope
const hits = await getCitiesByPostalCode('90210')
// [{ city, state, countryCode: 'US', postalCode: '90210', bridge: 'exact'|'state-only' }, ...]

// Optional country filter (still returns an array)
await getCitiesByPostalCode('90210', 'US')
```

`bridge: 'exact'` means the place matched a city already in `countrycitystatejson`. `state-only` means the state matched but the place name is not in that city list.

## Updates

A monthly Jenkins job recompiles from GeoNames and opens a GitHub PR when data changes. After merge, maintainers release manually with 2FA (`npm run release:postal-us` from the monorepo).

## License

MIT (package code). GeoNames data: CC BY.
