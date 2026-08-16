#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const SRC_LIB = path.join(ROOT, 'src/lib')
const TARGETS = [
  path.join(ROOT, 'dist/cjs/lib'),
  path.join(ROOT, 'dist/esm/lib'),
]

const FILES = ['compiledCities.json', 'compiledCountryAndStates.json']

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name)
    const to = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDir(from, to)
    else fs.copyFileSync(from, to)
  }
}

for (const target of TARGETS) {
  fs.mkdirSync(target, { recursive: true })
  for (const file of FILES) {
    fs.copyFileSync(path.join(SRC_LIB, file), path.join(target, file))
  }

  const byCountrySrc = path.join(SRC_LIB, 'by-country')
  if (fs.existsSync(byCountrySrc)) {
    copyDir(byCountrySrc, path.join(target, 'by-country'))
  }
}

console.log('Copied compiled JSON datasets (including by-country chunks) into dist/*/lib')
