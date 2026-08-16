'use strict'

/** Filter a country-keyed object to an allowlist (ISO alpha-2). */
function pickCountries(db, codes) {
  const picked = Object.create(null)
  const missing = []
  for (const code of codes) {
    const key = String(code).toUpperCase()
    if (db[key] != null) picked[key] = db[key]
    else missing.push(key)
  }
  return { picked, missing }
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

module.exports = {
  pickCountries,
  buildInverted,
  parseCountriesList,
}
