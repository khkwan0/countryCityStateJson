#!/usr/bin/env node
'use strict'

/**
 * Download GeoNames postal dumps, bridge to compiledCities.json, and emit
 * scoped indexes for packages/postal-us and packages/postal-world.
 *
 * Usage:
 *   node scripts/compile-postal.js              # US + world
 *   node scripts/compile-postal.js --scope=us
 *   node scripts/compile-postal.js --scope=world
 *   node scripts/compile-postal.js --skip-download  # use cached zips
 */

const fs = require('fs')
const path = require('path')
const https = require('https')
const { execFileSync } = require('child_process')
const { createHash } = require('crypto')

const ROOT = path.join(__dirname, '..')
const CACHE = path.join(ROOT, '.cache/geonames')
const CITIES_PATH = path.join(ROOT, 'src/lib/compiledCities.json')
const GEONAMES_ZIP = 'https://download.geonames.org/export/zip'

const US_STATE_ALIASES = {
  al: 'alabama',
  ak: 'alaska',
  az: 'arizona',
  ar: 'arkansas',
  ca: 'california',
  co: 'colorado',
  ct: 'connecticut',
  de: 'delaware',
  dc: 'district of columbia',
  fl: 'florida',
  ga: 'georgia',
  hi: 'hawaii',
  id: 'idaho',
  il: 'illinois',
  in: 'indiana',
  ia: 'iowa',
  ks: 'kansas',
  ky: 'kentucky',
  la: 'louisiana',
  me: 'maine',
  md: 'maryland',
  ma: 'massachusetts',
  mi: 'michigan',
  mn: 'minnesota',
  ms: 'mississippi',
  mo: 'missouri',
  mt: 'montana',
  ne: 'nebraska',
  nv: 'nevada',
  nh: 'new hampshire',
  nj: 'new jersey',
  nm: 'new mexico',
  ny: 'new york',
  nc: 'north carolina',
  nd: 'north dakota',
  oh: 'ohio',
  ok: 'oklahoma',
  or: 'oregon',
  pa: 'pennsylvania',
  ri: 'rhode island',
  sc: 'south carolina',
  sd: 'south dakota',
  tn: 'tennessee',
  tx: 'texas',
  ut: 'utah',
  vt: 'vermont',
  va: 'virginia',
  wa: 'washington',
  wv: 'west virginia',
  wi: 'wisconsin',
  wy: 'wyoming',
  as: 'american samoa',
  gu: 'guam',
  mp: 'northern mariana islands',
  pr: 'puerto rico',
  vi: 'u s virgin islands',
}

function normalizeName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function parseArgs(argv) {
  const opts = { scope: 'all', skipDownload: false }
  for (const arg of argv) {
    if (arg === '--skip-download') opts.skipDownload = true
    else if (arg.startsWith('--scope=')) opts.scope = arg.slice('--scope='.length)
  }
  return opts
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close()
          try {
            fs.unlinkSync(dest)
          } catch (_) {
            /* ignore */
          }
          download(res.headers.location, dest).then(resolve, reject)
          return
        }
        if (res.statusCode !== 200) {
          file.close()
          reject(new Error(`GET ${url} -> ${res.statusCode}`))
          return
        }
        res.pipe(file)
        file.on('finish', () => file.close(() => resolve(dest)))
      })
      .on('error', (err) => {
        try {
          fs.unlinkSync(dest)
        } catch (_) {
          /* ignore */
        }
        reject(err)
      })
  })
}

async function ensureZipAsync(name, skipDownload) {
  fs.mkdirSync(CACHE, { recursive: true })
  const dest = path.join(CACHE, name)
  if (skipDownload) {
    if (!fs.existsSync(dest)) {
      throw new Error(`Missing cached ${dest}; run without --skip-download`)
    }
    return dest
  }
  console.log(`Downloading ${name}...`)
  await download(`${GEONAMES_ZIP}/${name}`, dest)
  return dest
}

function unzipToTxt(zipPath, expectedTxtName) {
  const outDir = path.join(CACHE, path.basename(zipPath, '.zip') + '_extract')
  fs.rmSync(outDir, { recursive: true, force: true })
  fs.mkdirSync(outDir, { recursive: true })
  execFileSync('unzip', ['-q', '-o', zipPath, '-d', outDir])
  const txtPath = path.join(outDir, expectedTxtName)
  if (!fs.existsSync(txtPath)) {
    const found = fs.readdirSync(outDir).find((f) => f.endsWith('.txt'))
    if (!found) throw new Error(`No .txt in ${zipPath}`)
    return path.join(outDir, found)
  }
  return txtPath
}

function buildCityLookups(compiledCities) {
  const byCountry = Object.create(null)

  for (const [shortName, country] of Object.entries(compiledCities)) {
    const code = String(shortName).toUpperCase()
    const states = new Map()
    const stateAliases = new Map()

    for (const [stateName, cities] of Object.entries(country.states || {})) {
      const stateKey = normalizeName(stateName)
      const cityMap = new Map()
      for (const city of cities || []) {
        if (!city || !city.name) continue
        cityMap.set(normalizeName(city.name), city.name)
      }
      states.set(stateKey, { name: stateName, cities: cityMap })
      stateAliases.set(stateKey, stateName)
    }

    if (code === 'US') {
      for (const [abbr, full] of Object.entries(US_STATE_ALIASES)) {
        if (states.has(full)) stateAliases.set(abbr, states.get(full).name)
      }
    }

    byCountry[code] = { states, stateAliases }
  }

  return byCountry
}

function resolveState(lookup, admin1, adminCode1) {
  if (!lookup) return null
  const candidates = [admin1, adminCode1].filter(Boolean).map(normalizeName)
  for (const c of candidates) {
    if (lookup.stateAliases.has(c)) return lookup.stateAliases.get(c)
    if (lookup.states.has(c)) return lookup.states.get(c).name
  }
  return null
}

function bridgeRow(lookup, place, admin1, adminCode1) {
  if (!lookup) return null
  const stateName = resolveState(lookup, admin1, adminCode1)
  if (!stateName) return null

  const stateKey = normalizeName(stateName)
  const stateEntry = lookup.states.get(stateKey)
  if (!stateEntry) return null

  const placeKey = normalizeName(place)
  const cityName = stateEntry.cities.get(placeKey)
  if (cityName) {
    return [cityName, stateName, 'exact']
  }
  if (place) {
    return [place, stateName, 'state-only']
  }
  return null
}

function parsePostalTxt(txtPath, countryFilter, lookups) {
  const byCountry = Object.create(null)
  const stats = { rows: 0, bridged: 0, skipped: 0 }

  const text = fs.readFileSync(txtPath, 'utf8')
  for (const line of text.split('\n')) {
    if (!line) continue
    const parts = line.split('\t')
    const country = (parts[0] || '').toUpperCase()
    const postal = (parts[1] || '').trim().toUpperCase()
    const place = parts[2] || ''
    const admin1 = parts[3] || ''
    const adminCode1 = parts[4] || ''
    if (!country || !postal) continue
    if (countryFilter && country !== countryFilter) continue

    stats.rows++
    const lookup = lookups[country]
    const hit = bridgeRow(lookup, place, admin1, adminCode1)
    if (!hit) {
      stats.skipped++
      continue
    }
    stats.bridged++

    if (!byCountry[country]) byCountry[country] = Object.create(null)
    if (!byCountry[country][postal]) byCountry[country][postal] = new Map()
    const key = `${hit[0]}\0${hit[1]}\0${hit[2]}`
    byCountry[country][postal].set(key, hit)
  }

  const indexes = Object.create(null)
  for (const [cc, postals] of Object.entries(byCountry)) {
    indexes[cc] = Object.create(null)
    for (const [postal, map] of Object.entries(postals)) {
      indexes[cc][postal] = [...map.values()]
    }
  }

  return { indexes, stats }
}

function buildInverted(indexes) {
  const inverted = Object.create(null)
  for (const [cc, postals] of Object.entries(indexes)) {
    for (const postal of Object.keys(postals)) {
      if (!inverted[postal]) inverted[postal] = []
      if (!inverted[postal].includes(cc)) inverted[postal].push(cc)
    }
  }
  for (const postal of Object.keys(inverted)) {
    inverted[postal].sort()
  }
  return inverted
}

function writeScopePackage(pkgDir, indexes) {
  const byCountryDir = path.join(pkgDir, 'src/lib/postal-by-country')
  fs.rmSync(byCountryDir, { recursive: true, force: true })
  fs.mkdirSync(byCountryDir, { recursive: true })

  const codes = Object.keys(indexes).sort()
  for (const code of codes) {
    fs.writeFileSync(
      path.join(byCountryDir, `${code}.json`),
      JSON.stringify(indexes[code])
    )
  }

  const inverted = buildInverted(indexes)
  fs.writeFileSync(
    path.join(pkgDir, 'src/lib/postal-to-countries.json'),
    JSON.stringify(inverted)
  )

  const loaderLines = codes.map(
    (code) =>
      `  ${JSON.stringify(code)}: () => import('./lib/postal-by-country/${code}.json'),`
  )
  const loadersSource = `/* eslint-disable */
// AUTO-GENERATED by scripts/compile-postal.js — do not edit.
import type { CountryPostalLoader } from './shared/types'

export const countryLoaders: Record<string, CountryPostalLoader> = {
${loaderLines.join('\n')}
}

export const countryCodes: string[] = Object.keys(countryLoaders)
`

  fs.writeFileSync(path.join(pkgDir, 'src/loaders.generated.ts'), loadersSource)

  const hash = createHash('sha256')
  for (const code of codes) {
    hash.update(code)
    hash.update(JSON.stringify(indexes[code]))
  }
  hash.update(JSON.stringify(inverted))
  const digest = hash.digest('hex')
  fs.writeFileSync(path.join(pkgDir, 'src/lib/DATA_HASH'), `${digest}\n`)

  return { countries: codes.length, postals: Object.keys(inverted).length, hash: digest }
}

function syncSharedInto(pkgDir) {
  const sharedSrc = path.join(ROOT, 'packages/postal-shared/src')
  const dest = path.join(pkgDir, 'src/shared')
  fs.rmSync(dest, { recursive: true, force: true })
  fs.mkdirSync(dest, { recursive: true })
  for (const file of fs.readdirSync(sharedSrc)) {
    if (!file.endsWith('.ts')) continue
    fs.copyFileSync(path.join(sharedSrc, file), path.join(dest, file))
  }
}


async function compile(opts) {
  if (!fs.existsSync(CITIES_PATH)) {
    throw new Error(`Missing ${CITIES_PATH}; run npm run compile first`)
  }
  const compiledCities = JSON.parse(fs.readFileSync(CITIES_PATH, 'utf8'))
  const lookups = buildCityLookups(compiledCities)

  const doUs = opts.scope === 'all' || opts.scope === 'us'
  const doWorld = opts.scope === 'all' || opts.scope === 'world'

  if (doUs) {
    const zip = await ensureZipAsync('US.zip', opts.skipDownload)
    const txt = unzipToTxt(zip, 'US.txt')
    const { indexes, stats } = parsePostalTxt(txt, 'US', lookups)
    console.log(`US bridge: rows=${stats.rows} bridged=${stats.bridged} skipped=${stats.skipped}`)
    const pkg = path.join(ROOT, 'packages/postal-us')
    syncSharedInto(pkg)
    const meta = writeScopePackage(pkg, indexes)
    console.log(
      `Wrote postal-us: ${meta.countries} countries, ${meta.postals} postals, hash=${meta.hash.slice(0, 12)}…`
    )
  }

  if (doWorld) {
    const zip = await ensureZipAsync('allCountries.zip', opts.skipDownload)
    const txt = unzipToTxt(zip, 'allCountries.txt')
    const { indexes, stats } = parsePostalTxt(txt, null, lookups)
    console.log(
      `World bridge: rows=${stats.rows} bridged=${stats.bridged} skipped=${stats.skipped} countries=${Object.keys(indexes).length}`
    )
    const pkg = path.join(ROOT, 'packages/postal-world')
    syncSharedInto(pkg)
    const meta = writeScopePackage(pkg, indexes)
    console.log(
      `Wrote postal-world: ${meta.countries} countries, ${meta.postals} postals, hash=${meta.hash.slice(0, 12)}…`
    )
  }
}

if (require.main === module) {
  const opts = parseArgs(process.argv.slice(2))
  compile(opts).catch((err) => {
    console.error('compile-postal failed:', err.message || err)
    process.exit(1)
  })
}

module.exports = {
  normalizeName,
  buildCityLookups,
  bridgeRow,
  buildInverted,
  parseArgs,
  writeScopePackage,
  syncSharedInto,
  compile,
}
