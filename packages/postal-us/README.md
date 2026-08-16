# countrycitystatejson-postal-us

Look up **US ZIP codes** → city / state. Data is bridged onto names from [`countrycitystatejson`](https://www.npmjs.com/package/countrycitystatejson).

| | |
|---|---|
| **Install size (data)** | **~2.5MB** unpacked |
| **Scope** | United States only |
| **When to use** | You only need US ZIPs — prefer this over the world package |

Need more countries? Use [`countrycitystatejson-postal-world`](https://www.npmjs.com/package/countrycitystatejson-postal-world) (~**35MB**).

Postal source: [GeoNames](https://www.geonames.org/) ([CC BY](https://creativecommons.org/licenses/by/4.0/) — please credit).

## Install

```bash
npm i countrycitystatejson-postal-us
```

You do **not** need to install `countrycitystatejson` for postal lookup to work (results are plain `{ city, state, countryCode, … }` strings). Install the core package only if you also want the country → state → city hierarchy.

## Use

```js
import { getCitiesByPostalCode } from 'countrycitystatejson-postal-us'
// or: const { getCitiesByPostalCode } = require('countrycitystatejson-postal-us')

const hits = await getCitiesByPostalCode('90210')
```

Example shape:

```js
[
  {
    city: 'Beverly Hills',
    state: 'California',
    countryCode: 'US',
    postalCode: '90210',
    bridge: 'exact', // 'exact' | 'state-only'
  },
]
```

```js
// Optional country filter (still an array)
await getCitiesByPostalCode('90210', 'US')

await getCitiesByPostalCode('00000') // []
```

**Always `await`.** Return value is always an **array** of every match (never a single auto-picked city).

| `bridge` | Meaning |
|---|---|
| `exact` | Place name matched a city in `countrycitystatejson` |
| `state-only` | State matched; place name is not in that city list |

Also exported: `preloadCountryPostal('US')`, `clearPostalCache()`, and a default object with the same methods.

## License

MIT (package code). GeoNames postal data: CC BY.
