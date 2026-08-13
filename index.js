// Backward-compatible entry for consumers that resolve the package root index.
// Prefer the package "main"/"exports" fields (dist/cjs or dist/esm).
module.exports = require('./dist/cjs/index.js')
