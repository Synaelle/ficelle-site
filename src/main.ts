// SPDX-License-Identifier: AGPL-3.0-or-later

import { mount } from 'svelte'
import App from './App.svelte'
import { followTheme } from './theme'
import './fonts.css'
import './site.css'

followTheme()

const target = document.getElementById('app')
if (!target) throw new Error('missing #app element in index.html')
export default mount(App, { target })
