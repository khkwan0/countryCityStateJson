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

for (const target of TARGETS) {
  fs.mkdirSync(target, { recursive: true })
  for (const file of FILES) {
    fs.copyFileSync(path.join(SRC_LIB, file), path.join(target, file))
  }
}

console.log('Copied compiled JSON datasets into dist/*/lib')
