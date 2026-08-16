const path = require('path')
const { compile, buildCountryIdIndex } = require('../compile-data')

describe('compile-data', () => {
  it('indexes CSC countries by sortname', () => {
    const index = buildCountryIdIndex([
      { id: 1, sortname: 'us', name: 'United States' },
      { id: 2, sortname: 'CA', name: 'Canada' },
    ])
    expect(index.get('US').id).toBe(1)
    expect(index.get('CA').id).toBe(2)
  })

  it('compile helper is exported', () => {
    expect(typeof compile).toBe('function')
  })
})
