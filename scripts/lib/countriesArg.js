'use strict'

const fs = require('fs')

/**
 * Parse --countries / --countries-file from argv.
 * @returns {{ codes: string[] | null, forceInplace: boolean, outDir: string | null, rest: string[] }}
 */
function parseCountriesArgv(argv) {
  const rest = []
  let codes = null
  let forceInplace = false
  let outDir = null
  let countriesFile = null

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--force-inplace') {
      forceInplace = true
      continue
    }
    if (arg.startsWith('--out-dir=')) {
      outDir = arg.slice('--out-dir='.length)
      continue
    }
    if (arg === '--out-dir') {
      outDir = argv[++i]
      continue
    }
    if (arg.startsWith('--countries-file=')) {
      countriesFile = arg.slice('--countries-file='.length)
      continue
    }
    if (arg === '--countries-file') {
      countriesFile = argv[++i]
      continue
    }
    if (arg.startsWith('--countries=')) {
      codes = parseCountriesList(arg.slice('--countries='.length))
      continue
    }
    if (arg === '--countries') {
      codes = parseCountriesList(argv[++i])
      continue
    }
    rest.push(arg)
  }

  if (countriesFile) {
    const fromFile = parseCountriesFile(countriesFile)
    codes = codes ? [...new Set([...codes, ...fromFile])] : fromFile
  }

  return { codes, forceInplace, outDir, rest }
}

function parseCountriesList(raw) {
  if (raw == null || String(raw).trim() === '') {
    throw new Error('Empty --countries list')
  }
  const parts = String(raw)
    .split(/[,\s]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
  if (!parts.length) throw new Error('Empty --countries list')
  for (const code of parts) {
    if (!/^[A-Z]{2}$/.test(code)) {
      throw new Error(`Invalid country code (want ISO alpha-2): ${code}`)
    }
  }
  return [...new Set(parts)].sort()
}

function parseCountriesFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8')
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/#.*$/, '').trim())
    .filter(Boolean)
  return parseCountriesList(lines.join(','))
}

/**
 * Filter an object keyed by country code to an allowlist.
 * @returns {{ picked: Record<string, unknown>, missing: string[] }}
 */
function pickCountries(db, codes) {
  const picked = Object.create(null)
  const missing = []
  for (const code of codes) {
    if (db[code] != null) picked[code] = db[code]
    else missing.push(code)
  }
  return { picked, missing }
}

module.exports = {
  parseCountriesArgv,
  parseCountriesList,
  parseCountriesFile,
  pickCountries,
}
