const fs = require('fs')
const os = require('os')
const path = require('path')
const {
  addJsonAttributes,
  resolveRelativeSpecifier,
  rewriteSource,
} = require('../fix-dual-package')

describe('fix-dual-package', () => {
  let dir

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ccs-dual-'))
    fs.writeFileSync(path.join(dir, 'server.js'), 'export const n = 1\n')
    fs.writeFileSync(path.join(dir, 'server.d.ts'), 'export const n: number\n')
    fs.mkdirSync(path.join(dir, 'types'))
    fs.writeFileSync(path.join(dir, 'types/index.d.ts'), 'export type X = string\n')
    fs.writeFileSync(path.join(dir, 'types/index.js'), 'export {}\n')
  })

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true })
  })

  it('adds .js to file specifiers and /index.js to directory specifiers', () => {
    const fromFile = path.join(dir, 'index.js')
    expect(resolveRelativeSpecifier(fromFile, './server')).toBe('./server.js')
    expect(resolveRelativeSpecifier(fromFile, './types')).toBe('./types/index.js')
    expect(resolveRelativeSpecifier(fromFile, './server.js')).toBe('./server.js')
    expect(resolveRelativeSpecifier(fromFile, 'trie-search')).toBe('trie-search')
  })

  it('rewrites static and dynamic relative imports', () => {
    const fromFile = path.join(dir, 'index.js')
    const source = `
export { n, default } from './server'
import type { X } from './types'
const load = () => import('./lib/by-country/US.json')
import db from './lib/compiledCities.json'
import TrieSearch from 'trie-search'
`
    const rewritten = rewriteSource(source, fromFile, { jsonAttributes: true })
    expect(rewritten).toContain("from './server.js'")
    expect(rewritten).toContain("from './types/index.js'")
    expect(rewritten).toContain("from 'trie-search'")
    expect(rewritten).toContain(
      "import('./lib/by-country/US.json', { with: { type: 'json' } })"
    )
    expect(rewritten).toContain(
      "from './lib/compiledCities.json' with { type: 'json' }"
    )
  })

  it('is idempotent', () => {
    const fromFile = path.join(dir, 'index.js')
    const source = "export { n } from './server'\nimport db from './x.json'\n"
    const once = rewriteSource(source, fromFile, { jsonAttributes: true })
    const twice = rewriteSource(once, fromFile, { jsonAttributes: true })
    expect(twice).toBe(once)
  })

  it('adds JSON attributes only when missing', () => {
    expect(addJsonAttributes("import db from './x.json'\n")).toContain(
      "with { type: 'json' }"
    )
    const already = "import db from './x.json' with { type: 'json' }\n"
    expect(addJsonAttributes(already)).toBe(already)
  })
})
