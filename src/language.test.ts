// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from 'vitest'
import { detectLang, langFromAddress, MESSAGES } from './language'

describe('detectLang', () => {
  it('takes the first language the page has', () => {
    expect(detectLang(['fr-FR', 'en-US'])).toBe('fr')
    expect(detectLang(['en-GB', 'fr'])).toBe('en')
    expect(detectLang(['de-DE', 'fr-CA', 'en'])).toBe('fr')
  })

  it('ignores case and region', () => {
    expect(detectLang(['FR'])).toBe('fr')
    expect(detectLang(['fr-BE'])).toBe('fr')
  })

  it('falls back to English', () => {
    expect(detectLang(['de-DE', 'ja'])).toBe('en')
    expect(detectLang([])).toBe('en')
  })
})

describe('langFromAddress', () => {
  it('reads ?lang= to show the page in another language', () => {
    expect(langFromAddress('?lang=fr')).toBe('fr')
    expect(langFromAddress('?os=android&lang=en')).toBe('en')
    expect(langFromAddress('?lang=de')).toBeUndefined()
    expect(langFromAddress('')).toBeUndefined()
  })
})

describe('MESSAGES', () => {
  it('puts a non-breaking space before French high punctuation', () => {
    const texts = Object.values(MESSAGES.fr).flatMap((v) =>
      typeof v === 'string' ? [v] : typeof v === 'function' ? [v('X')] : Object.values(v),
    )
    for (const text of texts) expect(text).not.toMatch(/(^|[^  ])[:;!?»]|«[^ ]/)
  })
})
