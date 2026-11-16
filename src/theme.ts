// SPDX-License-Identifier: AGPL-3.0-or-later

import { themeToCssVars, type Theme } from '@app/ui/theme'
import { builtInThemes, DEFAULT_THEME_ID } from '@app/ui/themes'

const theme = (builtInThemes.find((t) => t.id === DEFAULT_THEME_ID) ?? builtInThemes[0]) as Theme
const light = matchMedia('(prefers-color-scheme: light)')

/** The app's own theme on the page, dark unless the system asks for light. */
export function followTheme() {
  const apply = () => {
    const mode = light.matches ? 'light' : 'dark'
    const root = document.documentElement
    for (const [name, value] of Object.entries(themeToCssVars(theme, mode))) {
      root.style.setProperty(name, value)
    }
    root.dataset.mode = mode
    root.style.colorScheme = mode
  }
  apply()
  light.addEventListener('change', apply)
}
