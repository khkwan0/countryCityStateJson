# countrycitystatejson-postal-world

Worldwide postal code → city/state lookup, bridged onto [countrycitystatejson](https://www.npmjs.com/package/countrycitystatejson) names. Larger install than the US-only package.

Postal source: [GeoNames](https://www.geonames.org/) postal codes ([CC BY](https://creativecommons.org/licenses/by/4.0/)). Please credit GeoNames.

## Install

```bash
npm i countrycitystatejson-postal-world
```

Prefer [`countrycitystatejson-postal-us`](https://www.npmjs.com/package/countrycitystatejson-postal-us) if you only need the United States.

## Usage

```js
import { getCitiesByPostalCode } from 'countrycitystatejson-postal-world'

// Every country/place combination for this postal string
const hits = await getCitiesByPostalCode('1000')
// [{ city, state, countryCode, postalCode, bridge }, ...]

// Narrow to one country (still an array of places)
await getCitiesByPostalCode('1000', 'BE')
```

## Updates

Monthly GeoNames refresh opens a GitHub PR when indexes change. Maintainers merge, then `npm run release:postal-world` (2FA).

## License

MIT (package code). GeoNames data: CC BY.
