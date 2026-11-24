// SPDX-License-Identifier: AGPL-3.0-or-later
// Which system the visitor is on, and the files of the latest release for it.

export type System = 'windows' | 'linux' | 'android'
/** Where the visitor may be: a system with a build, or one with none where
 * the web version is the way (the Mac, iOS, the BSDs, Haiku). */
export type Seen = System | 'mac' | 'ios' | 'bsd' | 'haiku'

/** The systems with no app, where the page offers the web version first. */
export const webFirst = (s: Seen | null): boolean =>
  s === 'mac' || s === 'ios' || s === 'bsd' || s === 'haiku'

/** The web version, notes kept in the visitor's browser. */
export const WEB_URL = 'https://ficelle.synaelle.com/web/'

export const REPO = 'https://github.com/Synaelle/ficelle'
export const LATEST_PAGE = `${REPO}/releases/latest`
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
  // Haiku's browser calls itself a Mac, the BSDs say X11 like Linux
  if (/Haiku/.test(ua)) return 'haiku'
  if (/FreeBSD|OpenBSD|NetBSD|DragonFly/.test(ua)) return 'bsd'
  if (hint === 'windows' || /Windows/.test(ua)) return 'windows'
  if (hint === 'macos' || /Macintosh|Mac OS X/.test(ua)) {
    // an iPad asks for the desktop page and says Mac, but it has touch
    return maxTouchPoints > 1 ? 'ios' : 'mac'
  }
  if (hint === 'linux' || /Linux|X11/.test(ua)) return 'linux'
  return null
}

/** The processor the builds are for: x64 (Intel, AMD) or ARM64. */
export type Arch = 'x64' | 'arm'

/**
 * What the address or the user agent says: `?arch=arm` to see the page as an
 * ARM visitor does, else ARM when the user agent names it (Linux browsers
 * do), else x64, which Windows on ARM also runs.
 */
export function detectArch(search: string, userAgent: string): Arch {
  const asked = new URLSearchParams(search).get('arch')
  if (asked === 'arm' || asked === 'x64') return asked
  return /aarch64|arm64|armv8/i.test(userAgent) ? 'arm' : 'x64'
}

/** ARM as the browser's client hints tell it (Chromium browsers, Windows on
 * ARM included), null when the browser has no hints or says nothing. */
export async function hintedArch(): Promise<Arch | null> {
  const data = (
    navigator as Navigator & {
      userAgentData?: {
        getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }>
      }
    }
  ).userAgentData
  if (!data?.getHighEntropyValues) return null
  try {
    const { architecture } = await data.getHighEntropyValues(['architecture'])
    if (architecture === 'arm') return 'arm'
    if (architecture === 'x86') return 'x64'
    return null
  } catch {
    return null
  }
}

const SEEN: readonly Seen[] = ['windows', 'mac', 'linux', 'android', 'ios', 'bsd', 'haiku']

/**
 * The system asked for in the address, `?os=windows` (or `mac`, `linux`,
 * `android`, `ios`, `bsd`, `haiku`, `none` for one that is not detected), to see the page as
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
  installerArm?: string
  portableArm?: string
  appImageArm?: string
  archPackage?: string
  apk?: string
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
    installerArm: find(/_arm64-setup\.exe$/),
    portableArm: find(/_arm64_portable\.exe$/),
    appImageArm: find(/_aarch64\.AppImage$/),
    archPackage: find(/_x86_64\.pkg\.tar\.zst$/),
    apk: find(/-android\.apk$/),
  }
}

/** The command that installs the Arch package of `version` once
 * downloaded, the browser's Downloads folder assumed. */
export const pacmanCommand = (version: string): string =>
  `sudo pacman -U ~/Downloads/Ficelle_${version}_x86_64.pkg.tar.zst`

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
}

/** The same downloads from this server, kept by its mirror job every two
 * hours, or null when the server has no mirror. */
export async function mirroredFiles(): Promise<Mirrored | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}mirror/mirror.json`)
    if (!res.ok) return null
    const list = (await res.json()) as { stable: ReleaseJson }
    return { stable: filesOf(list.stable) }
  } catch {
    return null
  }
}
