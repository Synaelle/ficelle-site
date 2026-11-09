<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- One button for the visitor's system, an arrow for the others. Without a
     system it can tell, it sends to the release page; later, to the web version. -->
<script lang="ts">
  import chevron from 'lucide-static/icons/chevron-down.svg?raw'
  import download from 'lucide-static/icons/download.svg?raw'
  import globe from 'lucide-static/icons/globe.svg?raw'
  import obtainium from './obtainium.svg?raw'
  import { slide } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'
  import {
    detectSystem,
    latestFiles,
    LATEST_PAGE,
    MAC_DMG,
    MAC_DOC,
    MAC_VERSION,
    OBTAINIUM,
    systemFromAddress,
    type Files,
    type Seen,
    type System,
  } from './download'

  const seen = navigator as Navigator & { userAgentData?: { platform?: string } }
  const asked = systemFromAddress(location.search)
  const system: Seen | null =
    asked !== undefined
      ? asked
      : detectSystem({
          userAgent: navigator.userAgent,
          platform: seen.userAgentData?.platform,
          maxTouchPoints: navigator.maxTouchPoints,
        })

  let files = $state<Files | null>(null)
  let open = $state(false)
  latestFiles().then((found) => (files = found))

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches
  const opening = { duration: still ? 0 : 220, easing: cubicOut }

  // until GitHub answers, or if it does not, every link goes to the release page
  const link = (url: string | undefined) => url ?? LATEST_PAGE
  const version = $derived(files?.version ?? '')

  const NAMES: Record<System, string> = {
    windows: 'Windows',
    mac: 'macOS',
    linux: 'Linux',
    android: 'Android',
  }

  // one row per system, its files side by side: more packages add buttons, not rows
  interface Row {
    system: System
    version: string
    files: { kind: string; href: string }[]
    untested?: boolean
  }
  const all: Row[] = $derived([
    {
      system: 'windows',
      version,
      files: [
        { kind: 'Installer', href: link(files?.installer) },
        { kind: 'Portable', href: link(files?.portable) },
      ],
    },
    {
      system: 'mac',
      version: MAC_VERSION,
      files: [{ kind: 'Disk image', href: MAC_DMG }],
      untested: true,
    },
    { system: 'linux', version, files: [{ kind: 'AppImage', href: link(files?.appImage) }] },
    { system: 'android', version, files: [{ kind: 'APK', href: link(files?.apk) }] },
  ])
  // the visitor's own system first, the others in their usual order
  const rows = $derived([
    ...all.filter((r) => r.system === system),
    ...all.filter((r) => r.system !== system),
  ])
  const hasBuild = (s: Seen | null): s is System => s !== null && s !== 'ios'

  const main = $derived.by(() => {
    switch (system) {
      case 'windows':
        return { href: link(files?.installer), detail: `Installer ${version}` }
      case 'mac':
        return { href: MAC_DMG, detail: `Disk image ${MAC_VERSION}, untested` }
      case 'linux':
        return { href: link(files?.appImage), detail: `AppImage ${version}` }
      case 'android':
        return { href: link(files?.apk), detail: `APK ${version}` }
      default:
        return { href: LATEST_PAGE, detail: 'Every system, on GitHub' }
    }
  })
</script>

<div class="download">
  <div class="row">
    <div class="split">
      <a class="main" href={main.href}>
        <span class="icon">{@html download}</span>
        <span class="text">
          <span class="label"
            >{hasBuild(system) ? `Download for ${NAMES[system]}` : 'See all downloads'}</span
          >
          <span class="detail">{main.detail.trim()}</span>
        </span>
      </a>
      <button
        class="more"
        aria-label="Other systems"
        aria-expanded={open}
        aria-controls="systems"
        onclick={() => (open = !open)}
      >
        <span class="icon chevron" class:flipped={open}>{@html chevron}</span>
      </button>
    </div>
    {#if system === 'android'}
      <a class="other" href={OBTAINIUM}>
        <span class="icon">{@html obtainium}</span>
        <span class="text">
          <span class="label">Get it on Obtainium</span>
          <span class="detail">Automatic updates</span>
        </span>
      </a>
    {/if}
    <button class="web" disabled title="Coming later">
      <span class="icon">{@html globe}</span>
      <span class="text">
        <span class="label">Web version</span>
        <span class="detail">Coming later</span>
      </span>
    </button>
  </div>

  {#if system === 'mac'}
    <p class="note">The Mac app is untested, see <a href={MAC_DOC}>Ficelle on a Mac</a>.</p>
  {:else if system === 'linux'}
    <p class="note">Packages for Debian, Fedora, the AUR and Flathub are coming soon.</p>
  {:else if system === 'ios'}
    <p class="note">
      There is no iOS app, I have no Apple device to test one on. The web version, with a phone
      layout, will be the way to use Ficelle on an iPhone or iPad, until a Mac or iOS contributor
      joins or I get the hardware.
    </p>
  {:else if !system}
    <p class="note">Your system could not be detected, or Ficelle does not support it yet.</p>
  {/if}

  {#if open}
    <div id="systems" class="menu" transition:slide={opening}>
      <ul>
        {#each rows as row (row.system)}
          <li class="item" class:current={row.system === system}>
            <span class="system">
              {NAMES[row.system]}
              {#if row.untested}<span class="tag">Untested</span>{/if}
            </span>
            <span class="files">
              {#each row.files as file (file.kind)}
                <a class="file" href={file.href}>
                  <span class="icon">{@html download}</span>{file.kind}
                </a>
              {/each}
            </span>
            <span class="version">{row.version}</span>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style>
  .download {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-3);
  }
  .split {
    display: flex;
  }
  .main,
  .more,
  .other,
  .web {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    border-radius: var(--radius-control);
    font: inherit;
    text-decoration: none;
  }
  .main {
    padding: var(--space-3) var(--space-5);
    background: var(--color-accent);
    color: var(--color-accent-on);
    border-radius: var(--radius-control) 0 0 var(--radius-control);
  }
  .main:hover {
    background: var(--color-accent-pressed);
  }
  .more {
    padding: 0 var(--space-3);
    border: none;
    border-left: 1px solid color-mix(in srgb, var(--color-accent-on) 25%, transparent);
    background: var(--color-accent);
    color: var(--color-accent-on);
    border-radius: 0 var(--radius-control) var(--radius-control) 0;
    cursor: pointer;
  }
  .more:hover {
    background: var(--color-accent-pressed);
  }
  .other {
    padding: var(--space-3) var(--space-5);
    border: 1px solid var(--color-border-strong);
    background: var(--color-surface);
    color: var(--color-text);
  }
  .other:hover {
    border-color: var(--color-text-muted);
  }
  .web {
    padding: var(--space-3) var(--space-5);
    border: 1px solid var(--color-border-strong);
    background: transparent;
    color: var(--color-text-muted);
  }
  .web:disabled {
    cursor: not-allowed;
  }
  .text {
    display: grid;
    text-align: left;
  }
  .label {
    font-weight: 750;
    line-height: 1.3;
  }
  .detail {
    font-size: 13px;
    font-weight: 550;
    opacity: 0.9;
  }
  .icon {
    display: flex;
  }
  .icon :global(svg) {
    width: 20px;
    height: 20px;
  }
  .chevron {
    transition: transform var(--dur-base) var(--ease-out);
  }
  .flipped {
    transform: rotate(180deg);
  }
  .note {
    margin: 0;
    max-width: 60ch;
    color: var(--color-text-muted);
    font-size: 15px;
  }

  .menu {
    width: min(480px, 100%);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-popover);
    background: var(--color-surface);
    text-align: left;
    overflow: hidden;
  }
  .menu ul {
    margin: 0;
    padding: var(--space-1);
    list-style: none;
  }
  .item {
    display: grid;
    grid-template-columns: 96px 1fr auto;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    border-left: 2px solid transparent;
  }
  .item + .item {
    border-top: 1px solid var(--color-border);
  }
  .item.current {
    border-left-color: var(--color-accent);
  }
  .system {
    display: grid;
    justify-items: start;
    gap: 2px;
    font-weight: 700;
  }
  .tag {
    padding: 0 var(--space-1);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-control);
    color: var(--color-text-muted);
    font-size: 11px;
    font-weight: 600;
  }
  .files {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .file {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-3) var(--space-1) var(--space-2);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-control);
    color: var(--color-text);
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition:
      border-color var(--dur-fast) var(--ease-out),
      background var(--dur-fast) var(--ease-out);
  }
  .file:hover,
  .file:focus-visible {
    border-color: var(--color-accent);
    background: var(--color-surface-2);
  }
  .file .icon {
    color: var(--color-text-faint);
    transition: color var(--dur-fast) var(--ease-out);
  }
  .file:hover .icon {
    color: var(--color-accent);
  }
  .file .icon :global(svg) {
    width: 16px;
    height: 16px;
  }
  .version {
    color: var(--color-text-faint);
    font-family: var(--font-mono);
    font-size: 13px;
  }

  /* phones: one column of full width buttons, easy to reach with a thumb */
  @media (max-width: 560px) {
    .download {
      width: 100%;
      justify-items: stretch;
    }
    .row {
      flex-direction: column;
      align-items: stretch;
    }
    .main {
      flex: 1;
      padding: var(--space-4);
    }
    .more {
      padding: 0 var(--space-4);
    }
    .other,
    .web {
      padding: var(--space-3) var(--space-4);
    }
    .menu {
      width: 100%;
    }
    .item {
      grid-template-columns: 80px 1fr auto;
    }
    .note {
      justify-self: center;
      text-align: center;
    }
  }
</style>
