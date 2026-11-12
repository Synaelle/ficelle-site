<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<script lang="ts">
  import check from 'lucide-static/icons/check.svg?raw'
  import chevron from 'lucide-static/icons/chevron-down.svg?raw'
  import globe from 'lucide-static/icons/globe.svg?raw'
  import Knot from '@app/ui/Knot.svelte'
  import Download from './Download.svelte'
  import github from './github.svg?raw'
  import desktopShot from './screens/desktop.png'
  import phoneShot from './screens/phone.png'
  import { REPO } from './download'
  import {
    detectLang,
    langFromAddress,
    LANGS,
    MESSAGES,
    NATIVE_NAMES,
    saveLang,
    savedLang,
    type Lang,
  } from './language'

  const SIZE = 128

  let lang = $state<Lang>(
    langFromAddress(location.search) ?? savedLang() ?? detectLang(navigator.languages),
  )
  const t = $derived(MESSAGES[lang])
  const description = document.querySelector('meta[name="description"]')
  $effect(() => {
    document.documentElement.lang = lang
    description?.setAttribute('content', t.description)
  })
  // the languages stay out of the way: one small button, the list opens under it
  let picking = $state(false)
  let picker = $state<HTMLElement>()
  function closeOutside(event: PointerEvent) {
    if (picking && !picker?.contains(event.target as Node)) picking = false
  }
  function closeOnEscape(event: KeyboardEvent) {
    if (picking && event.key === 'Escape') {
      picking = false
      picker?.querySelector<HTMLButtonElement>('.current')?.focus()
    }
  }

  function choose(chosen: Lang) {
    picking = false
    lang = chosen
    saveLang(chosen)
    // an address that asks for a language would undo the choice on reload
    const url = new URL(location.href)
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', chosen)
      history.replaceState(null, '', url)
    }
  }

  // the knot ties itself a moment after the page shows, so it is seen, and
  // again under the pointer once it has finished
  // the tie lasts 760 ms (Knot.svelte), a timer is surer than its end event,
  // which a hidden tab never sends
  const TIE_MS = 800
  let shown = $state(false)
  let round = $state(0)
  let tying = true
  setTimeout(() => {
    shown = true
    setTimeout(() => (tying = false), TIE_MS)
  }, 600)
  function again() {
    if (tying) return
    tying = true
    round++
    setTimeout(() => (tying = false), TIE_MS)
  }
</script>

<svelte:window onpointerdown={closeOutside} onkeydown={closeOnEscape} />

<div class="picker" bind:this={picker}>
  <button
    class="current"
    aria-label={t.language}
    aria-expanded={picking}
    aria-controls="languages"
    onclick={() => (picking = !picking)}
  >
    <span class="icon">{@html globe}</span>
    <span>{lang.toUpperCase()}</span>
    <span class="icon chevron" class:flipped={picking}>{@html chevron}</span>
  </button>
  {#if picking}
    <ul id="languages" aria-label={t.language}>
      {#each LANGS as each (each)}
        <li>
          <button
            lang={each}
            aria-current={each === lang ? 'true' : undefined}
            onclick={() => choose(each)}
          >
            {NATIVE_NAMES[each]}
            {#if each === lang}<span class="icon">{@html check}</span>{/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<main>
  <section class="intro">
    <!-- the app's unlock screen knot, tying itself -->
    <div
      class="mark"
      style:width="{SIZE}px"
      style:height="{SIZE}px"
      onpointerenter={again}
      aria-hidden="true"
    >
      {#if shown}
        {#key round}
          <Knot motion="tie" size={SIZE} />
        {/key}
      {/if}
    </div>
    <h1>Ficelle</h1>
    <p class="lead">{t.lead}</p>
    <Download {t} />
    <div class="links">
      <a class="source" href={REPO} aria-label={t.source} title={t.source}>
        {@html github}
      </a>
    </div>
  </section>

  <section class="screens" aria-label={t.screenshots}>
    <img class="desktop" src={desktopShot} alt={t.desktopShot} width="1280" height="800" />
    <img class="phone" src={phoneShot} alt={t.phoneShot} width="1080" height="2201" />
  </section>
</main>

<style>
  main {
    width: min(1120px, 100% - 2 * var(--space-4));
    margin: 0 auto;
    padding-bottom: var(--space-7);
  }
  .intro {
    display: grid;
    justify-items: center;
    text-align: center;
    padding: var(--space-7) 0;
  }
  .mark {
    display: grid;
    place-items: center;
  }
  h1 {
    margin: var(--space-4) 0 0;
    font-size: clamp(36px, 6vw, 56px);
    line-height: 1.05;
    font-weight: 700;
    letter-spacing: -0.01em;
  }
  .lead {
    margin: var(--space-3) 0 var(--space-6);
    max-width: 30ch;
    color: var(--color-text-muted);
    font-size: clamp(18px, 2.4vw, 22px);
    line-height: 1.35;
  }
  .links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: var(--space-4);
    margin-top: var(--space-5);
  }
  .source {
    display: flex;
    padding: var(--space-2);
    color: var(--color-text-muted);
    border-radius: var(--radius-control);
  }
  .source:hover {
    color: var(--color-text);
  }
  .source :global(svg) {
    width: 26px;
    height: 26px;
  }
  .picker {
    position: absolute;
    top: var(--space-3);
    right: var(--space-3);
    z-index: 1;
    display: grid;
    justify-items: end;
    gap: var(--space-1);
  }
  .picker button {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    border: none;
    border-radius: var(--radius-control);
    background: none;
    color: var(--color-text-muted);
    font: inherit;
    font-size: 14px;
    cursor: pointer;
  }
  .current {
    padding: var(--space-2) var(--space-2);
  }
  .picker button:hover,
  .current[aria-expanded='true'] {
    color: var(--color-text);
  }
  .icon {
    display: flex;
  }
  .icon :global(svg) {
    width: 16px;
    height: 16px;
  }
  .chevron {
    transition: transform var(--dur-fast) var(--ease-out);
  }
  .flipped {
    transform: rotate(180deg);
  }
  .picker ul {
    min-width: 160px;
    margin: 0;
    padding: var(--space-1);
    list-style: none;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-popover);
    background: var(--color-surface);
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.35);
  }
  .picker li button {
    width: 100%;
    justify-content: space-between;
    padding: var(--space-2) var(--space-3);
    color: var(--color-text);
  }
  .picker li button:hover {
    background: var(--color-surface-2);
  }
  .picker li button[aria-current] {
    font-weight: 700;
  }
  .picker li .icon {
    color: var(--color-accent-text);
  }
  .screens {
    position: relative;
    padding-bottom: var(--space-7);
  }
  .screens img {
    display: block;
    height: auto;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-window);
  }
  .desktop {
    width: 88%;
  }
  .phone {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 22%;
    border-color: var(--color-border-strong);
  }

  @media (max-width: 700px) {
    .intro {
      padding-top: var(--space-6);
    }
    .desktop {
      width: 100%;
    }
    .phone {
      position: static;
      width: 46%;
      margin: calc(-1 * var(--space-7)) var(--space-4) 0 auto;
    }
  }
</style>
