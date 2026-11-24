<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- One button for the visitor's system and processor, an arrow for the
     others. A file built for both processors carries a chip that picks one,
     set at first to the visitor's. On a
     system with no app (iOS, the BSDs, Haiku) the main button opens the web
     version, the downloads stay under the arrow. Without a system it can
     tell, it sends to the release page. The Arch package has a question
     mark beside it that shows the command installing it, to copy. -->
<script lang="ts">
  import check from 'lucide-static/icons/check.svg?raw'
  import chevron from 'lucide-static/icons/chevron-down.svg?raw'
  import copy from 'lucide-static/icons/copy.svg?raw'
  import help from 'lucide-static/icons/circle-help.svg?raw'
  import download from 'lucide-static/icons/download.svg?raw'
  import globe from 'lucide-static/icons/globe.svg?raw'
  import obtainium from './obtainium.svg?raw'
  import { slide } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'
  import {
    detectArch,
    detectSystem,
    hintedArch,
    latestFiles,
    LATEST_PAGE,
    mirroredFiles,
    OBTAINIUM,
    pacmanCommand,
    systemFromAddress,
    WEB_URL,
    webFirst,
    type Arch,
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

  // the user agent first, the client hints when the browser gives them
  let arch = $state<Arch>(detectArch(location.search, navigator.userAgent))
  if (!new URLSearchParams(location.search).has('arch'))
    hintedArch().then((hinted) => hinted && (arch = hinted))

  let fromGithub = $state<Files | null>(null)
  let mirror = $state<Mirrored | null>(null)
  let pickedMirror = $state(false)
  let open = $state(false)
  latestFiles().then((found) => (fromGithub = found))
  mirroredFiles().then((found) => (mirror = found))

  // this server's copy when picked, or when GitHub cannot be reached
  const onMirror = $derived(!!mirror && (pickedMirror || !fromGithub))
  const files = $derived(onMirror ? mirror!.stable : fromGithub)

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches
  const opening = { duration: still ? 0 : 220, easing: cubicOut }

  // until GitHub answers, or if it does not, every link goes to the release page
  const link = (url: string | undefined) => url ?? LATEST_PAGE
  const version = $derived(files?.version ?? '')

  const NAMES: Record<System, string> = {
    windows: 'Windows',
    linux: 'Linux',
    android: 'Android',
  }

  const ARCHS: Record<Arch, string> = { x64: 'x64', arm: 'ARM64' }

  // one row per system, its files side by side: more packages add buttons,
  // not rows. A file with an ARM build has a second address, one installed
  // from a terminal has its command
  interface File {
    id: string
    kind: string
    href: string
    arm?: string
    command?: string
  }
  interface Row {
    system: System
    version: string
    files: File[]
  }
  const all: Row[] = $derived([
    {
      system: 'windows',
      version,
      files: [
        {
          id: 'installer',
          kind: t.installer,
          href: link(files?.installer),
          arm: files?.installerArm,
        },
        { id: 'portable', kind: t.portable, href: link(files?.portable), arm: files?.portableArm },
      ],
    },
    {
      system: 'linux',
      version,
      files: [
        { id: 'appimage', kind: 'AppImage', href: link(files?.appImage), arm: files?.appImageArm },
        {
          id: 'arch',
          kind: t.archPackage,
          href: link(files?.archPackage),
          command: version ? pacmanCommand(version) : undefined,
        },
      ],
    },
    {
      system: 'android',
      version,
      files: [{ id: 'apk', kind: 'APK', href: link(files?.apk) }],
    },
  ])

  // the processor each file's chip is on, the visitor's until changed
  let picked = $state<Record<string, Arch>>({})
  let choosing = $state<string | null>(null)
  const chosen = (file: File): Arch => picked[file.id] ?? arch
  function pick(file: File, value: Arch) {
    picked[file.id] = value
    choosing = null
    document.getElementById(`chip-${file.id}`)?.focus()
  }

  // the file whose command shows, and whether it was just copied
  let showing = $state<string | null>(null)
  let copied = $state<'yes' | 'failed' | null>(null)
  let copiedTimer: ReturnType<typeof setTimeout> | undefined
  const shown = (row: Row) => row.files.find((f) => f.id === showing && f.command)
  async function copyCommand(command: string) {
    clearTimeout(copiedTimer)
    try {
      await navigator.clipboard.writeText(command)
      copied = 'yes'
      copiedTimer = setTimeout(() => (copied = null), 2000)
    } catch {
      copied = 'failed'
    }
  }

  // the visitor's own system first, the others in their usual order
  const rows = $derived([
    ...all.filter((r) => r.system === system),
    ...all.filter((r) => r.system !== system),
  ])
  const hasBuild = (s: Seen | null): s is System => s !== null && !webFirst(s)

  const main = $derived.by(() => {
    switch (system) {
      case 'windows':
        // Windows on ARM runs the x64 build when there is no ARM one
        return arch === 'arm' && files?.installerArm
          ? { href: link(files.installerArm), detail: `${t.installer} ${version} · ARM64` }
          : { href: link(files?.installer), detail: `${t.installer} ${version}` }
      case 'linux':
        return arch === 'arm'
          ? { href: link(files?.appImageArm), detail: `AppImage ${version} · ARM64` }
          : { href: link(files?.appImage), detail: `AppImage ${version}` }
      case 'android':
        return { href: link(files?.apk), detail: `APK ${version}` }
      default:
        return { href: LATEST_PAGE, detail: t.everySystem }
    }
  })
</script>

<svelte:window
  onclick={(e) => {
    if (choosing && !(e.target as Element).closest('.chooser')) choosing = null
  }}
  onkeydown={(e) => {
    if (e.key === 'Escape' && choosing) {
      document.getElementById(`chip-${choosing}`)?.focus()
      choosing = null
    }
  }}
/>

<div class="download">
  <div class="row">
    <div class="split">
      {#if webFirst(system)}
        <a class="main" href={WEB_URL}>
          <span class="icon">{@html globe}</span>
          <span class="text">
            <span class="label">{t.webMain}</span>
            <span class="detail">{t.webMainDetail}</span>
          </span>
        </a>
      {:else}
        <a class="main" href={main.href}>
          <span class="icon">{@html download}</span>
          <span class="text">
            <span class="label"
              >{hasBuild(system) ? t.downloadFor(NAMES[system]) : t.allDownloads}</span
            >
            <span class="detail">{main.detail.trim()}</span>
          </span>
        </a>
      {/if}
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
    {#if !webFirst(system)}
      <a class="web" href={WEB_URL}>
        <span class="icon">{@html globe}</span>
        <span class="text">
          <span class="label">{t.web}</span>
          <span class="detail">{t.webDetail}</span>
        </span>
      </a>
    {/if}
  </div>

  {#if system === 'ios'}
    <p class="note">{t.iosNote}</p>
  {:else if system === 'mac' || system === 'bsd' || system === 'haiku'}
    <p class="note">{t.noAppNote}</p>
  {:else if !system}
    <p class="note">{t.unknownNote}</p>
  {/if}

  {#if open}
    <div id="systems" class="menu" transition:slide={opening}>
      <ul>
        {#each rows as row (row.system)}
          <li class="item" class:current={row.system === system}>
            <span class="system">
              {NAMES[row.system]}
            </span>
            <span class="files">
              {#each row.files as file (file.id)}
                {#if file.arm}
                  <span class="pair">
                    <a
                      class="file"
                      href={chosen(file) === 'arm' ? file.arm : file.href}
                      aria-label={`${NAMES[row.system]} ${file.kind} ${ARCHS[chosen(file)]}`}
                    >
                      <span class="icon">{@html download}</span>{file.kind}
                    </a>
                    <span class="chooser">
                      <button
                        id="chip-{file.id}"
                        class="chip"
                        class:other={chosen(file) !== arch}
                        aria-haspopup="menu"
                        aria-expanded={choosing === file.id}
                        aria-label={`${t.processor}, ${ARCHS[chosen(file)]}`}
                        onclick={() => (choosing = choosing === file.id ? null : file.id)}
                      >
                        {ARCHS[chosen(file)]}<span class="icon">{@html chevron}</span>
                      </button>
                      {#if choosing === file.id}
                        <span class="choices" role="menu" aria-label={t.processor}>
                          {#each ['x64', 'arm'] as const as value (value)}
                            <button
                              role="menuitemradio"
                              aria-checked={chosen(file) === value}
                              onclick={() => pick(file, value)}
                            >
                              {ARCHS[value]}
                              {#if chosen(file) === value}<span class="icon">{@html check}</span
                                >{/if}
                            </button>
                          {/each}
                        </span>
                      {/if}
                    </span>
                  </span>
                {:else if file.command}
                  <span class="pair">
                    <a class="file" href={file.href}>
                      <span class="icon">{@html download}</span>{file.kind}
                    </a>
                    <button
                      class="chip help"
                      aria-expanded={showing === file.id}
                      aria-controls="command-{file.id}"
                      aria-label={`${file.kind}, ${t.archCommand}`}
                      title={t.archCommand}
                      onclick={() => {
                        showing = showing === file.id ? null : file.id
                        copied = null
                      }}><span class="icon">{@html help}</span></button
                    >
                  </span>
                {:else}
                  <a class="file" href={file.href}>
                    <span class="icon">{@html download}</span>{file.kind}
                  </a>
                {/if}
              {/each}
            </span>
            <span class="version">{row.version}</span>
            {#if shown(row)?.command}
              {@const file = shown(row)!}
              <div
                id="command-{file.id}"
                class="command"
                role="group"
                aria-label={t.archCommand}
                transition:slide={opening}
              >
                <code>{file.command}</code>
                <button class="copy" onclick={() => void copyCommand(file.command!)}>
                  <span class="icon">{@html copied === 'yes' ? check : copy}</span>
                  {copied === 'yes' ? t.copied : t.copy}
                </button>
                {#if copied === 'failed'}<p class="failed" role="alert">{t.copyFailed}</p>{/if}
              </div>
            {/if}
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
  .other,
  .web {
    padding: var(--space-3) var(--space-5);
    border: 1px solid var(--color-border-strong);
    background: var(--color-surface);
    color: var(--color-text);
  }
  .other:hover,
  .web:hover {
    border-color: var(--color-text-muted);
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
    width: min(520px, 100%);
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
  .pair {
    display: flex;
  }
  .pair .file {
    border-radius: var(--radius-control) 0 0 var(--radius-control);
  }
  .chooser {
    position: relative;
    display: flex;
  }
  .chip {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 0 var(--space-2);
    border: 1px solid var(--color-border-strong);
    border-left: none;
    border-radius: 0 var(--radius-control) var(--radius-control) 0;
    background: var(--color-surface-2);
    color: var(--color-text-muted);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
  }
  .chip.other,
  .chip[aria-expanded='true'] {
    color: var(--color-text);
  }
  .chip:hover,
  .chip:focus-visible {
    border-color: var(--color-accent);
  }
  .chip .icon :global(svg) {
    width: 12px;
    height: 12px;
  }
  .chip.help .icon :global(svg) {
    width: 15px;
    height: 15px;
  }
  .command {
    grid-column: 1 / -1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-control);
    background: var(--color-surface-2);
  }
  .command code {
    flex: 1 1 16em;
    min-width: 0;
    font-family: var(--font-mono);
    font-size: 13px;
    overflow-wrap: anywhere;
    user-select: all;
  }
  .copy {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-3) var(--space-1) var(--space-2);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-control);
    background: var(--color-surface);
    color: var(--color-text);
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }
  .copy:hover,
  .copy:focus-visible {
    border-color: var(--color-accent);
  }
  .copy .icon :global(svg) {
    width: 14px;
    height: 14px;
  }
  .failed {
    flex-basis: 100%;
    margin: 0;
    color: var(--color-text-muted);
    font-size: 13px;
  }
  .choices {
    position: absolute;
    top: calc(100% + var(--space-1));
    right: 0;
    z-index: 2;
    display: grid;
    min-width: 112px;
    padding: var(--space-1);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-popover);
    background: var(--color-surface-2);
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.35);
  }
  .choices button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-1) var(--space-2);
    border: none;
    border-radius: var(--radius-control);
    background: none;
    color: var(--color-text-muted);
    font-family: var(--font-mono);
    font-size: 12px;
    text-align: left;
    cursor: pointer;
  }
  .choices button[aria-checked='true'] {
    color: var(--color-text);
  }
  .choices button:hover,
  .choices button:focus-visible {
    background: var(--color-border);
    color: var(--color-text);
  }
  .choices .icon {
    color: var(--color-accent);
  }
  .choices .icon :global(svg) {
    width: 14px;
    height: 14px;
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
    /* the version under the name, the files get the width */
    .item {
      grid-template-columns: 80px 1fr;
    }
    .version {
      grid-column: 1;
      grid-row: 2;
    }
    .files {
      grid-row: span 2;
    }
    .note {
      justify-self: center;
      text-align: center;
    }
  }
</style>
