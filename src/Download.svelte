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
    MAC_FALLBACK_DMG,
    MAC_FALLBACK_VERSION,
    MAC_DOC,
    mirroredFiles,
    newestFiles,
    OBTAINIUM,
    systemFromAddress,
    type Files,
    type Mirrored,
    type Seen,
    type System,
  } from './download'
  import type { Messages } from './locales/en'

  let { t }: { t: Messages } = $props()

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

  let fromGithub = $state<Files | null>(null)
  // the newest build, a beta or the release itself when no beta is newer
  let newestFromGithub = $state<Files | null>(null)
  let mirror = $state<Mirrored | null>(null)
  let pickedMirror = $state(false)
  let beta = $state(false)
  let open = $state(false)
  latestFiles().then((found) => (fromGithub = found))
  newestFiles().then((found) => (newestFromGithub = found))
  mirroredFiles().then((found) => (mirror = found))

  // this server's copy when picked, or when GitHub cannot be reached
  const onMirror = $derived(!!mirror && (pickedMirror || !fromGithub))
  const files = $derived(onMirror ? mirror!.stable : fromGithub)
  const newest = $derived(onMirror ? mirror!.newest : newestFromGithub)

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches
  const opening = { duration: still ? 0 : 220, easing: cubicOut }

  // until GitHub answers, or if it does not, every link goes to the release page
  const link = (url: string | undefined) => url ?? LATEST_PAGE
  const version = $derived(files?.version ?? '')
  // the latest release's Mac file, else the last one that had one
  const mac = $derived(
    files?.dmg
      ? { href: files.dmg, version }
      : { href: MAC_FALLBACK_DMG, version: MAC_FALLBACK_VERSION },
  )

  // the menu lists the release, or the newest build once Beta is picked; the
  // main button always stays on the release
  const listed = $derived(beta && newest ? newest : files)
  const listedVersion = $derived(listed?.version ?? '')
  // betas rarely have a Mac build, the Mac row then keeps the release's
  const listedMac = $derived(
    beta && newest?.dmg ? { href: newest.dmg, version: newest.version } : mac,
  )
  const betaNewer = $derived(!!newest && !!files && newest.version !== files.version)

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
      version: listedVersion,
      files: [
        { kind: t.installer, href: link(listed?.installer) },
        { kind: t.portable, href: link(listed?.portable) },
      ],
    },
    {
      system: 'mac',
      version: listedMac.version,
      files: [{ kind: t.diskImage, href: listedMac.href }],
      untested: true,
    },
    {
      system: 'linux',
      version: listedVersion,
      files: [{ kind: 'AppImage', href: link(listed?.appImage) }],
    },
    {
      system: 'android',
      version: listedVersion,
      files: [{ kind: 'APK', href: link(listed?.apk) }],
    },
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
        return { href: link(files?.installer), detail: `${t.installer} ${version}` }
      case 'mac':
        return { href: mac.href, detail: t.macDetail(mac.version) }
      case 'linux':
        return { href: link(files?.appImage), detail: `AppImage ${version}` }
      case 'android':
        return { href: link(files?.apk), detail: `APK ${version}` }
      default:
        return { href: LATEST_PAGE, detail: t.everySystem }
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
            >{hasBuild(system) ? t.downloadFor(NAMES[system]) : t.allDownloads}</span
          >
          <span class="detail">{main.detail.trim()}</span>
        </span>
      </a>
      <button
        class="more"
        aria-label={t.otherSystems}
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
          <span class="label">{t.obtainium}</span>
          <span class="detail">{t.obtainiumDetail}</span>
        </span>
      </a>
    {/if}
    <button class="web" disabled title={t.webLater}>
      <span class="icon">{@html globe}</span>
      <span class="text">
        <span class="label">{t.web}</span>
        <span class="detail">{t.webLater}</span>
      </span>
    </button>
  </div>

  {#if system === 'mac'}
    <p class="note">
      {t.macNote.before}<a href={MAC_DOC}>{t.macNote.link}</a>{t.macNote.after}
    </p>
  {:else if system === 'linux'}
    <p class="note">{t.linuxNote}</p>
  {:else if system === 'ios'}
    <p class="note">{t.iosNote}</p>
  {:else if !system}
    <p class="note">{t.unknownNote}</p>
  {/if}

  {#if open}
    <div id="systems" class="menu" transition:slide={opening}>
      {#if files && newest}
        <div class="channels">
          <div class="switch" role="group" aria-label={t.channel}>
            <button aria-pressed={!beta} onclick={() => (beta = false)}>
              {t.stable} <span class="number">{files.version}</span>
            </button>
            <button aria-pressed={beta} onclick={() => (beta = true)}>
              {t.beta} <span class="number">{newest.version}</span>
            </button>
          </div>
          {#if beta}
            <p class="channel-note">
              {#if betaNewer}
                {t.betaNote}
                {#if !newest.dmg}{t.betaNoMac(mac.version)}{/if}
              {:else}
                {t.noNewerBeta(newest.version)}
              {/if}
            </p>
          {/if}
        </div>
      {/if}
      <ul>
        {#each rows as row (row.system)}
          <li class="item" class:current={row.system === system}>
            <span class="system">
              {NAMES[row.system]}
              {#if row.untested}<span class="tag">{t.untested}</span>{/if}
            </span>
            <span class="files">
              {#each row.files as file (file.kind)}
                <a class="file" href={file.href}>
                  <span class="icon">{@html download}</span>{file.kind}
                </a>
              {/each}
            </span>
            <span class="version" class:ahead={betaNewer && row.version === newest?.version}
              >{row.version}</span
            >
          </li>
        {/each}
      </ul>
      {#if mirror}
        <p class="source" role="group" aria-label={t.downloadFrom}>
          <span>{t.downloadFrom}</span>
          <button
            aria-pressed={!onMirror}
            disabled={!fromGithub}
            title={fromGithub ? undefined : t.githubDown}
            onclick={() => (pickedMirror = false)}>GitHub</button
          >
          <span aria-hidden="true">·</span>
          <button aria-pressed={onMirror} onclick={() => (pickedMirror = true)}>{t.mirror}</button>
        </p>
      {/if}
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
  .channels {
    display: grid;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-3) var(--space-1);
  }
  .switch {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 2px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-control);
    background: var(--color-bg);
  }
  .switch button {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: var(--space-2);
    padding: 6px var(--space-3);
    border: none;
    border-radius: var(--radius-control);
    background: transparent;
    color: var(--color-text-muted);
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition:
      background var(--dur-fast) var(--ease-out),
      color var(--dur-fast) var(--ease-out);
  }
  .switch button:hover {
    color: var(--color-text);
  }
  .switch button[aria-pressed='true'] {
    background: var(--color-surface-2);
    box-shadow: inset 0 0 0 1px var(--color-border-strong);
    color: var(--color-text);
  }
  .number {
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 400;
  }
  .channel-note {
    margin: 0;
    padding: 0 var(--space-1);
    color: var(--color-text-muted);
    font-size: 13px;
    line-height: 1.45;
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
  .version.ahead {
    color: var(--color-accent-text);
  }
  .source {
    display: flex;
    justify-content: flex-end;
    align-items: baseline;
    gap: var(--space-1);
    margin: 0;
    padding: var(--space-2) var(--space-3);
    border-top: 1px solid var(--color-border);
    color: var(--color-text-faint);
    font-size: 12px;
  }
  .source button {
    padding: 0;
    border: none;
    background: none;
    color: var(--color-text-muted);
    font: inherit;
    cursor: pointer;
  }
  .source button:hover:not(:disabled) {
    color: var(--color-text);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .source button[aria-pressed='true'] {
    color: var(--color-text);
    font-weight: 700;
  }
  .source button:disabled {
    cursor: not-allowed;
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
    .switch button {
      min-height: 44px;
      align-items: center;
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
