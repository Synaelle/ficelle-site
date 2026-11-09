// SPDX-License-Identifier: AGPL-3.0-or-later

import { themeToCssVars, type Theme } from '@app/ui/theme'
import { builtInThemes, DEFAULT_THEME_ID } from '@app/ui/themes'
import { mount } from 'svelte'
import App from './App.svelte'
import './fonts.css'
import './site.css'

const theme = (builtInThemes.find((t) => t.id === DEFAULT_THEME_ID) ?? builtInThemes[0]) as Theme
const light = matchMedia('(prefers-color-scheme: light)')

// the app's own theme, dark unless the system asks for light
function applyTheme() {
  const mode = light.matches ? 'light' : 'dark'
  const root = document.documentElement
  for (const [name, value] of Object.entries(themeToCssVars(theme, mode))) {
    root.style.setProperty(name, value)
  }
  root.dataset.mode = mode
  root.style.colorScheme = mode
}
applyTheme()
light.addEventListener('change', applyTheme)

const target = document.getElementById('app')
if (!target) throw new Error('missing #app element in index.html')
export default mount(App, { target })
