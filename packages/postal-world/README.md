# countrycitystatejson-postal-world

Look up **postal codes** → city / state from GeoNames, bridged onto names from [`countrycitystatejson`](https://www.npmjs.com/package/countrycitystatejson) when possible.

| | |
|---|---|
| **Install size (data)** | **~35MB** unpacked |
| **Scope** | ~60 countries (GeoNames rows that join to this dataset’s state/city names) |
| **When to use** | You need non-US (or multi-country) postal lookup |

**US only?** Install the smaller package instead:

```bash
npm i countrycitystatejson-postal-us   # ~2.5MB — prefer this for US-only apps
```

## Attribution

Postal data is derived from **[GeoNames](https://www.geonames.org/)** ([postal dumps](https://download.geonames.org/export/zip/)), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). If you use this package, please credit GeoNames, for example:

> This product includes postal data from [GeoNames](https://www.geonames.org/) (CC BY 4.0).

## Install

```bash
npm i countrycitystatejson-postal-world
```

You do **not** need `countrycitystatejson` installed for postal lookup (results are plain strings). Add the core package only if you also need the country → state → city hierarchy.

## Use

```js
import { getCitiesByPostalCode } from 'countrycitystatejson-postal-world'
// or: const { getCitiesByPostalCode } = require('countrycitystatejson-postal-world')

// Every match in this package (all countries that share this postal string)
const hits = await getCitiesByPostalCode('1000')
```

Example shape:

```js
[
  {
    city: '…',
    state: '…',
    countryCode: 'BE', // or US, AT, …
    postalCode: '1000',
    bridge: 'exact', // 'exact' | 'state-only' | 'none'
  },
  // …more rows if the same postal exists in other countries
]
```

```js
// Narrow to one country (still an array of places)
await getCitiesByPostalCode('1000', 'BE')

await getCitiesByPostalCode('99999') // []
```

**Always `await`.** Return value is always an **array** of every matching combination — including cross-country collisions when you omit `countryCode`.

| `bridge` | Meaning |
|---|---|
| `exact` | Place name matched a city in `countrycitystatejson` |
| `state-only` | State matched (admin1 or admin2); place name is not in that city list |
| `none` | No state match — GeoNames place/admin labels kept |

Also exported: `preloadCountryPostal(countryCode)`, `clearPostalCache()`, and a default object with the same methods.

## Smaller copy

```bash
npx ccs-subset --countries=US,DE,FR --out=./geo-subset --postal=world
```

(`ccs-subset` ships with `countrycitystatejson`.)

## Coverage note

Every GeoNames postal place is kept. When admin names do not match `countrycitystatejson` states, results still appear with `bridge: 'none'` (GeoNames labels). Treat this as a best-effort offline index, not an official postal authority feed.

## License

MIT (package code). Underlying postal dumps © [GeoNames](https://www.geonames.org/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — see [Attribution](#attribution).
