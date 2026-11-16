// SPDX-License-Identifier: AGPL-3.0-or-later

import { mount } from 'svelte'
import Brand from './Brand.svelte'
import { followTheme } from './theme'
import './fonts.css'
import './site.css'

followTheme()

const target = document.getElementById('app')
if (!target) throw new Error('missing #app element in brand/index.html')
export default mount(Brand, { target })
