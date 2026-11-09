<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- One button for the visitor's system, an arrow for the others. Without a
     system it can tell, it sends to the release page; later, to the web version. -->
<script lang="ts">
  import chevron from 'lucide-static/icons/chevron-down.svg?raw'
  import download from 'lucide-static/icons/download.svg?raw'
  import globe from 'lucide-static/icons/globe.svg?raw'
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
    type System,
  } from './download'

  const seen = navigator as Navigator & { userAgentData?: { platform?: string } }
  const asked = systemFromAddress(location.search)
  const system: System | null =
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

  interface Item {
    system: System
    kind: string
    version: string
    href: string
    untested?: boolean
  }
  const items: Item[] = $derived([
    { system: 'windows', kind: 'Installer', version, href: link(files?.installer) },
    { system: 'windows', kind: 'Portable', version, href: link(files?.portable) },
    { system: 'mac', kind: 'Disk image', version: MAC_VERSION, href: MAC_DMG, untested: true },
    { system: 'linux', kind: 'AppImage', version, href: link(files?.appImage) },
    { system: 'android', kind: 'APK', version, href: link(files?.apk) },
  ])

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
          <span class="label">{system ? `Download for ${NAMES[system]}` : 'See all downloads'}</span
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
    <button class="web" disabled title="Coming later">
      <span class="icon">{@html globe}</span>
      <span class="text">
        <span class="label">Web version</span>
        <span class="detail">Coming later</span>
      </span>
    </button>
  </div>

  {#if !system}
    <p class="unknown">Your system could not be detected, or Ficelle does not support it yet.</p>
  {/if}

  {#if open}
    <div id="systems" class="menu" transition:slide={opening}>
      <ul>
        {#each items as item (item.system + item.kind)}
          <li>
            <a class="item" class:current={item.system === system} href={item.href}>
              <span class="system">{NAMES[item.system]}</span>
              <span class="kind">
                {item.kind}
                {#if item.untested}<span class="tag">Untested</span>{/if}
              </span>
              <span class="version">{item.version}</span>
              <span class="icon">{@html download}</span>
            </a>
          </li>
        {/each}
      </ul>
      <div class="foot">
        <span class="mac">The Mac app is untested, see <a href={MAC_DOC}>Ficelle on a Mac</a>.</span
        >
        <a class="badge" href={OBTAINIUM}>
          <img
            src="https://raw.githubusercontent.com/ImranR98/Obtainium/main/assets/graphics/badge_obtainium.png"
            alt="Get it on Obtainium"
            height="36"
          />
        </a>
      </div>
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
  .unknown {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 14px;
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
    grid-template-columns: 84px 1fr auto 20px;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    border-left: 2px solid transparent;
    border-radius: var(--radius-control);
    color: var(--color-text);
    text-decoration: none;
    transition: background var(--dur-fast) var(--ease-out);
  }
  .item:hover,
  .item:focus-visible {
    background: var(--color-surface-2);
  }
  .item.current {
    border-left-color: var(--color-accent);
  }
  .system {
    font-weight: 700;
  }
  .kind {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-text-muted);
    font-weight: 550;
  }
  .tag {
    padding: 0 var(--space-1);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-control);
    font-size: 12px;
    font-weight: 600;
  }
  .version {
    color: var(--color-text-faint);
    font-family: var(--font-mono);
    font-size: 13px;
  }
  .item .icon {
    color: var(--color-text-faint);
    transition: color var(--dur-fast) var(--ease-out);
  }
  .item:hover .icon {
    color: var(--color-accent);
  }
  .item .icon :global(svg) {
    width: 18px;
    height: 18px;
  }
  .foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-top: 1px solid var(--color-border);
  }
  .mac {
    color: var(--color-text-muted);
    font-size: 13px;
  }
  .badge img {
    display: block;
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
    .web {
      padding: var(--space-3) var(--space-4);
    }
    .menu {
      width: 100%;
    }
    .item {
      grid-template-columns: 72px 1fr auto 20px;
    }
    .kind {
      white-space: nowrap;
    }
    /* the note under the menu says it */
    .tag {
      display: none;
    }
    .unknown {
      text-align: center;
    }
  }
</style>
