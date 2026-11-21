// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from 'vitest'
import { detectArch, detectSystem, filesOf, systemFromAddress } from './download'

const UA = {
  windows:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36',
  mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  linux: 'Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0',
  android:
    'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Mobile Safari/537.36',
  iphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  freebsd: 'Mozilla/5.0 (X11; FreeBSD amd64; rv:144.0) Gecko/20100101 Firefox/144.0',
  haiku:
    'Mozilla/5.0 (Macintosh; Intel Haiku R1 x86_64) AppleWebKit/605.1.15 (KHTML, like Gecko) WebPositive/1.3 Version/11.1 Safari/605.1.15',
  chromeos:
    'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36',
}

describe('detectSystem', () => {
  it('reads the desktop systems', () => {
    expect(detectSystem({ userAgent: UA.windows })).toBe('windows')
    expect(detectSystem({ userAgent: UA.mac })).toBe('mac')
    expect(detectSystem({ userAgent: UA.linux })).toBe('linux')
  })

  it('takes Android before Linux', () => {
    expect(detectSystem({ userAgent: UA.android })).toBe('android')
  })

  it('prefers the browser platform hint', () => {
    expect(detectSystem({ userAgent: UA.linux, platform: 'Windows' })).toBe('windows')
    expect(detectSystem({ userAgent: UA.linux, platform: 'Android' })).toBe('android')
  })

  it('tells iPhones and iPads apart, the iPad even when it says Mac', () => {
    expect(detectSystem({ userAgent: UA.iphone })).toBe('ios')
    expect(detectSystem({ userAgent: UA.mac, maxTouchPoints: 5 })).toBe('ios')
  })

  it('tells the BSDs and Haiku apart from Linux and the Mac', () => {
    expect(detectSystem({ userAgent: UA.freebsd })).toBe('bsd')
    expect(detectSystem({ userAgent: UA.haiku })).toBe('haiku')
  })

  it('offers nothing where there is no build', () => {
    expect(detectSystem({ userAgent: UA.chromeos })).toBeNull()
    expect(detectSystem({ userAgent: 'curl/8.0' })).toBeNull()
  })
})

describe('filesOf', () => {
  it('finds each file of a release', () => {
    const url = (name: string) => ({ name, browser_download_url: `https://x/${name}` })
    const files = filesOf({
      tag_name: 'v0.5.1',
      assets: [
        url('Ficelle_0.5.1_x64-setup.exe'),
        url('Ficelle_0.5.1_x64-setup.exe.sig'),
        url('Ficelle_0.5.1_x64_portable.exe'),
        url('Ficelle_0.5.1_amd64.AppImage'),
        url('Ficelle_0.5.1_amd64.tar.zst'),
        url('Ficelle_0.5.1_arm64-setup.exe'),
        url('Ficelle_0.5.1_arm64_portable.exe'),
        url('Ficelle_0.5.1_aarch64.AppImage'),
        url('ficelle-0.5.1-android.apk'),
        url('Ficelle_0.5.1_universal.dmg'),
        url('latest.json'),
      ],
    })
    expect(files).toEqual({
      version: '0.5.1',
      installer: 'https://x/Ficelle_0.5.1_x64-setup.exe',
      portable: 'https://x/Ficelle_0.5.1_x64_portable.exe',
      appImage: 'https://x/Ficelle_0.5.1_amd64.AppImage',
      installerArm: 'https://x/Ficelle_0.5.1_arm64-setup.exe',
      portableArm: 'https://x/Ficelle_0.5.1_arm64_portable.exe',
      appImageArm: 'https://x/Ficelle_0.5.1_aarch64.AppImage',
      apk: 'https://x/ficelle-0.5.1-android.apk',
    })
  })
})

describe('detectArch', () => {
  it('reads ARM from the address or the user agent, x64 otherwise', () => {
    expect(detectArch('', UA.windows)).toBe('x64')
    expect(detectArch('', UA.linux)).toBe('x64')
    expect(
      detectArch('', 'Mozilla/5.0 (X11; Linux aarch64; rv:144.0) Gecko/20100101 Firefox/144.0'),
    ).toBe('arm')
    expect(detectArch('?arch=arm', UA.windows)).toBe('arm')
    expect(detectArch('?arch=x64', 'Mozilla/5.0 (X11; Linux aarch64)')).toBe('x64')
  })
})

describe('systemFromAddress', () => {
  it('reads ?os= to show the page as another system sees it', () => {
    expect(systemFromAddress('?os=windows')).toBe('windows')
    expect(systemFromAddress('?os=android&x=1')).toBe('android')
    expect(systemFromAddress('?os=ios')).toBe('ios')
    expect(systemFromAddress('?os=none')).toBeNull()
    expect(systemFromAddress('?os=amiga')).toBeNull()
    expect(systemFromAddress('')).toBeUndefined()
  })
})
