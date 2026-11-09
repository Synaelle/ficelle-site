<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- One button for the visitor's system, an arrow for the others. Without a
     system it can tell, it sends to the release page; later, to the web version. -->
<script lang="ts">
  import chevron from 'lucide-static/icons/chevron-down.svg?raw'
  import download from 'lucide-static/icons/download.svg?raw'
  import globe from 'lucide-static/icons/globe.svg?raw'
  import {
    detectSystem,
    latestFiles,
    LATEST_PAGE,
    MAC_DMG,
    MAC_DOC,
    MAC_VERSION,
    OBTAINIUM,
    type Files,
    type System,
  } from './download'

  const seen = navigator as Navigator & { userAgentData?: { platform?: string } }
  const system: System | null = detectSystem({
    userAgent: navigator.userAgent,
    platform: seen.userAgentData?.platform,
    maxTouchPoints: navigator.maxTouchPoints,
  })

  let files = $state<Files | null>(null)
  let open = $state(false)
  latestFiles().then((found) => (files = found))

  // until GitHub answers, or if it does not, every link goes to the release page
  const link = (url: string | undefined) => url ?? LATEST_PAGE
  const version = $derived(files?.version ? ` ${files.version}` : '')

  const NAMES: Record<System, string> = {
    windows: 'Windows',
    mac: 'macOS',
    linux: 'Linux',
    android: 'Android',
  }

  const main = $derived.by(() => {
    switch (system) {
      case 'windows':
        return { href: link(files?.installer), detail: `Installer${version}` }
      case 'mac':
        return { href: MAC_DMG, detail: `Disk image ${MAC_VERSION}, untested` }
      case 'linux':
        return { href: link(files?.appImage), detail: `AppImage${version}` }
      case 'android':
        return { href: link(files?.apk), detail: `APK${version}` }
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
          <span class="detail">{main.detail}</span>
        </span>
      </a>
      <button
        class="more"
        aria-label="Other systems"
        aria-expanded={open}
        aria-controls="systems"
        onclick={() => (open = !open)}
      >
        <span class="icon" class:flipped={open}>{@html chevron}</span>
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
    <ul id="systems" class="systems">
      <li>
        <span class="name">Windows</span>
        <span class="files">
          <a href={link(files?.installer)}>Installer</a>
          <a href={link(files?.portable)}>Portable</a>
        </span>
      </li>
      <li>
        <span class="name">macOS</span>
        <span class="files">
          <a href={MAC_DMG}>Disk image <span class="mono">{MAC_VERSION}</span></a>
          <span class="note">Untested, see <a href={MAC_DOC}>Ficelle on a Mac</a></span>
        </span>
      </li>
      <li>
        <span class="name">Linux</span>
        <span class="files"><a href={link(files?.appImage)}>AppImage</a></span>
      </li>
      <li>
        <span class="name">Android</span>
        <span class="files">
          <a href={link(files?.apk)}>APK</a>
          <a class="badge" href={OBTAINIUM}>
            <img
              src="https://raw.githubusercontent.com/ImranR98/Obtainium/main/assets/graphics/badge_obtainium.png"
              alt="Get it on Obtainium"
              height="40"
            />
          </a>
        </span>
      </li>
    </ul>
  {/if}
</div>

<style>
  .download {
    display: grid;
    gap: var(--space-3);
  }
  .row {
    display: flex;
    flex-wrap: wrap;
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
    font-weight: 650;
    line-height: 1.3;
  }
  .detail {
    font-size: 13px;
    opacity: 0.85;
  }
  .icon {
    display: flex;
    transition: transform var(--dur-fast) var(--ease-out);
  }
  .icon :global(svg) {
    width: 20px;
    height: 20px;
  }
  .flipped {
    transform: rotate(180deg);
  }
  .unknown {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 14px;
  }
  .systems {
    margin: 0;
    padding: 0;
    list-style: none;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-popover);
    background: var(--color-surface);
    max-width: 560px;
  }
  .systems li {
    display: grid;
    grid-template-columns: 96px 1fr;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-4);
    align-items: start;
  }
  .systems li + li {
    border-top: 1px solid var(--color-border);
  }
  .name {
    color: var(--color-text-muted);
  }
  .files {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-4);
  }
  .note {
    flex-basis: 100%;
    color: var(--color-text-muted);
    font-size: 13px;
  }
  .badge {
    flex-basis: 100%;
    display: block;
    width: fit-content;
  }
  .badge img {
    display: block;
  }
  .mono {
    font-family: var(--font-mono);
    font-size: 13px;
  }
</style>
