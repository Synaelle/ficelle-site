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
  draft?: boolean
  assets?: { name: string; browser_download_url: string }[]
}

/** A version tag as numbers to sort by, a beta before its release, or null
 * for any other tag (the fixed "beta" release the beta apps read). */
function rank(tag: string): number[] | null {
  const m = /^v(\d+)\.(\d+)\.(\d+)(?:-beta\.(\d+))?$/.exec(tag)
  if (!m) return null
  return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? Infinity : Number(m[4])]
}

function isNewer(a: number[], b: number[]): boolean {
  const k = a.findIndex((n, i) => n !== b[i])
  // both ranks have four parts, so k is within each
  return k >= 0 && a[k]! > b[k]!
}

/** The newest release of either kind, beta or stable, the way beta apps update. */
export function newestRelease<R extends ReleaseJson>(releases: R[]): R | undefined {
  let best: { release: R; rank: number[] } | undefined
  for (const release of releases) {
    const r = release.draft ? null : rank(release.tag_name ?? '')
    if (r && (!best || isNewer(r, best.rank))) best = { release, rank: r }
  }
  return best?.release
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

export interface Mirrored {
  stable: Files
  newest: Files
}

/** The same downloads from this server, kept by deploy/mirror.sh every two
 * hours, or null when the server has no mirror. */
export async function mirroredFiles(): Promise<Mirrored | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}mirror/mirror.json`)
    if (!res.ok) return null
    const list = (await res.json()) as { stable: ReleaseJson; newest: ReleaseJson }
    return { stable: filesOf(list.stable), newest: filesOf(list.newest) }
  } catch {
    return null
  }
}

/** The newest release's files, a beta or the latest release when no beta is
 * newer, or null when GitHub cannot be reached. */
export async function newestFiles(): Promise<Files | null> {
  try {
    const res = await fetch('https://api.github.com/repos/Synaelle/ficelle/releases?per_page=30', {
      headers: { accept: 'application/vnd.github+json' },
    })
    if (!res.ok) return null
    const newest = newestRelease((await res.json()) as ReleaseJson[])
    return newest ? filesOf(newest) : null
  } catch {
    return null
  }
}
