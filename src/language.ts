// SPDX-License-Identifier: AGPL-3.0-or-later
// Which language the page speaks: the one asked for in the address, else the
// visitor's own choice, else the first of their system's that the page has.

import { en, type Messages } from './locales/en'
import { fr } from './locales/fr'

export type Lang = 'en' | 'fr'

export const MESSAGES: Record<Lang, Messages> = { en, fr }
/** Each language in its own words, for the switch. */
export const NATIVE_NAMES: Record<Lang, string> = { en: 'English', fr: 'Français' }
export const LANGS = Object.keys(MESSAGES) as Lang[]

const isLang = (tag: string): tag is Lang => (LANGS as string[]).includes(tag)

/** The first of the browser's languages the page has, English otherwise. */
export function detectLang(languages: readonly string[]): Lang {
  for (const tag of languages) {
    const base = tag.toLowerCase().split('-')[0] ?? ''
    if (isLang(base)) return base
  }
  return 'en'
}

/** The language asked for in the address, `?lang=fr`, undefined when none or unknown. */
export function langFromAddress(search: string): Lang | undefined {
  const asked = new URLSearchParams(search).get('lang')
  return asked !== null && isLang(asked) ? asked : undefined
}

const KEY = 'site.lang'

// storage can be blocked or missing (private windows, cookies off): the
// choice is then simply not remembered
export function savedLang(): Lang | undefined {
  try {
    const saved = localStorage.getItem(KEY)
    return saved !== null && isLang(saved) ? saved : undefined
  } catch {
    return undefined
  }
}

export function saveLang(lang: Lang) {
  try {
    localStorage.setItem(KEY, lang)
  } catch {
    // not remembered, see above
  }
}
