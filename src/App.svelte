<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<script lang="ts">
  import github from '@phosphor-icons/core/assets/regular/github-logo.svg?raw'
  import Knot from '@app/ui/Knot.svelte'
  import Download from './Download.svelte'
  import { REPO } from './download'

  const base = import.meta.env.BASE_URL
  const SIZE = 128

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
    <p class="lead">A lightweight, private notes app for your computer and your phone.</p>
    <Download />
    <a class="source" href={REPO} aria-label="Source code on GitHub" title="Source code on GitHub">
      {@html github}
    </a>
  </section>

  <section class="screens" aria-label="Screenshots">
    <img
      class="desktop"
      src="{base}screens/desktop.png"
      alt="Ficelle on a computer, a note with a checklist, a callout and a cat, beside the list of notes"
      width="1280"
      height="800"
    />
    <img
      class="phone"
      src="{base}screens/phone.png"
      alt="The same note on a phone"
      width="1080"
      height="2400"
    />
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
  .source {
    display: flex;
    margin-top: var(--space-5);
    padding: var(--space-2);
    color: var(--color-text-muted);
    border-radius: var(--radius-control);
  }
  .source:hover {
    color: var(--color-text);
  }
  .source :global(svg) {
    width: 28px;
    height: 28px;
    fill: currentColor;
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
