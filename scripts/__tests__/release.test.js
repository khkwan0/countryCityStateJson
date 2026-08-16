const { chooseVersion, datePrefix, nextDateVersion } = require('../release')

describe('release versioning', () => {
  it('formats YY.MM.DD from a local date', () => {
    expect(datePrefix(new Date(2026, 7, 16))).toBe('26.08.16')
    expect(datePrefix(new Date(2026, 3, 5))).toBe('26.04.05')
  })

  it('starts at 01 when nothing has shipped that day', () => {
    expect(nextDateVersion('26.08.16', [])).toBe('26.08.1601')
    expect(nextDateVersion('26.08.16', ['26.04.0501'])).toBe('26.08.1601')
  })

  it('increments the same-day counter from published versions', () => {
    expect(
      nextDateVersion('26.04.05', ['26.04.0501', '26.04.0401', '26.04.0502'])
    ).toBe('26.04.0503')
  })

  it('keeps an unpublished local bump on the same day', () => {
    expect(chooseVersion('26.08.16', [], '26.08.1601')).toBe('26.08.1601')
  })

  it('does not go backwards relative to a local version ahead of npm', () => {
    expect(chooseVersion('26.08.16', ['26.08.1601'], '26.08.1603')).toBe('26.08.1603')
  })

  it('bumps when local version is from an earlier day', () => {
    expect(chooseVersion('26.08.16', ['26.04.0501'], '26.04.0501')).toBe('26.08.1601')
  })

  it('rejects more than 99 publishes in one day', () => {
    expect(() => nextDateVersion('26.08.16', ['26.08.1699'])).toThrow(/Too many publishes/)
  })
})
