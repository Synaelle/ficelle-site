// SPDX-License-Identifier: AGPL-3.0-or-later
// Which system the visitor is on, and the files of the latest release for it.

export type System = 'windows' | 'mac' | 'linux' | 'android'
/** Where the visitor may be: a system with a build, or iOS, which has none. */
export type Seen = System | 'ios'

export const REPO = 'https://github.com/Synaelle/ficelle'
export const LATEST_PAGE = `${REPO}/releases/latest`
/** The last release known to have a Mac file: the Mac build is untested and
 * does not hold a release back, so a release may come without one. */
export const MAC_FALLBACK_VERSION = '0.5.0'
export const MAC_FALLBACK_DMG = `${REPO}/releases/download/v${MAC_FALLBACK_VERSION}/Ficelle_${MAC_FALLBACK_VERSION}_universal.dmg`
export const MAC_DOC = `${REPO}/blob/main/docs/mac.md`
export const OBTAINIUM = `https://apps.obtainium.imranr.dev/redirect?r=obtainium://add/${REPO}`

interface Browser {
  userAgent: string
  /** navigator.userAgentData.platform where the browser has it */
  platform?: string
  maxTouchPoints?: number
}

/**
 * The system to offer first, iOS (which has no build), or null when Ficelle
 * has no build for it (ChromeOS) or it cannot be told.
 */
export function detectSystem({
  userAgent,
  platform = '',
  maxTouchPoints = 0,
}: Browser): Seen | null {
  const ua = userAgent
  const hint = platform.toLowerCase()
  // Android says Linux too, so it comes first
  if (hint === 'android' || /Android/i.test(ua)) return 'android'
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios'
  if (hint === 'chrome os' || /CrOS/.test(ua)) return null
  if (hint === 'windows' || /Windows/.test(ua)) return 'windows'
  if (hint === 'macos' || /Macintosh|Mac OS X/.test(ua)) {
    // an iPad asks for the desktop page and says Mac, but it has touch
    return maxTouchPoints > 1 ? 'ios' : 'mac'
  }
  if (hint === 'linux' || /Linux|X11/.test(ua)) return 'linux'
  return null
}

const SEEN: readonly Seen[] = ['windows', 'mac', 'linux', 'android', 'ios']

/**
 * The system asked for in the address, `?os=windows` (or `mac`, `linux`,
 * `android`, `ios`, `none` for one that is not detected), to see the page as
 * it shows there. Undefined when the address asks for nothing.
 */
export function systemFromAddress(search: string): Seen | null | undefined {
  const asked = new URLSearchParams(search).get('os')
  if (asked === null) return undefined
  return SEEN.find((s) => s === asked) ?? null
}

export interface Files {
  version: string
  installer?: string
  portable?: string
  appImage?: string
  apk?: string
  dmg?: string
}

interface ReleaseJson {
  tag_name?: string
  assets?: { name: string; browser_download_url: string }[]
}

/** The download links of a release, from GitHub's release API answer. */
export function filesOf(release: ReleaseJson): Files {
  const find = (test: RegExp) =>
    release.assets?.find((a) => test.test(a.name))?.browser_download_url
  return {
    version: (release.tag_name ?? '').replace(/^v/, ''),
    installer: find(/_x64-setup\.exe$/),
    portable: find(/_x64_portable\.exe$/),
    appImage: find(/_amd64\.AppImage$/),
    apk: find(/-android\.apk$/),
    dmg: find(/_universal\.dmg$/),
  }
}

/** The latest release's files, or null when GitHub cannot be reached. */
export async function latestFiles(): Promise<Files | null> {
  try {
    const res = await fetch('https://api.github.com/repos/Synaelle/ficelle/releases/latest', {
      headers: { accept: 'application/vnd.github+json' },
    })
    if (!res.ok) return null
    return filesOf((await res.json()) as ReleaseJson)
  } catch {
    return null
  }
}
