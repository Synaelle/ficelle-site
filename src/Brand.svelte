<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- The brand page: the knot, the colours, the fonts and the app, each under
     its name and nothing more. -->
<script lang="ts">
  import download from 'lucide-static/icons/download.svg?raw'
  import Knot from '@app/ui/Knot.svelte'
  import desktopShot from './screens/desktop.png'

  const BASE = '/site/brand/'

  /** The dark theme's main colours, then the light one's, as the app draws them. */
  const COLOURS = [
    '#0E0D0D',
    '#161414',
    '#E6DFD8',
    '#9A918A',
    '#E44C3E',
    '#F1EFEA',
    '#FBFAF7',
    '#161413',
    '#5E5853',
    '#C1271B',
  ]
</script>

<header>
  <a class="home" href="/">
    <Knot size={28} />
    Ficelle
  </a>
  <a class="button" href="{BASE}ficelle-brand.zip" download>
    <span class="icon">{@html download}</span>
    Download everything
  </a>
</header>

<main>
  <h1>Brand</h1>

  <section>
    <h2>Logo</h2>
    <div class="logos">
      <div class="tile dark"><img src="{BASE}knot.svg" alt="The Ficelle knot on dark" /></div>
      <div class="tile light"><img src="{BASE}knot.svg" alt="The Ficelle knot on light" /></div>
    </div>
    <p class="files">
      <a href="{BASE}knot.svg" download>SVG</a>
      <a href="{BASE}knot-512.png" download>PNG</a>
    </p>
  </section>

  <section>
    <h2>Colours</h2>
    <ul class="colours">
      {#each COLOURS as colour (colour)}
        <li>
          <span class="swatch" style:background={colour}></span>
          <code>{colour}</code>
        </li>
      {/each}
    </ul>
  </section>

  <section>
    <h2>Fonts</h2>
    <p class="font ui">Hanken Grotesk</p>
    <p class="font editor">Atkinson Hyperlegible Next</p>
    <p class="font mono">JetBrains Mono</p>
  </section>

  <section>
    <h2>App</h2>
    <img
      class="shot"
      src={desktopShot}
      alt="Ficelle on a desktop with a note open"
      width="1280"
      height="800"
    />
  </section>
</main>

<style>
  :root {
    /* the two grounds the knot is shown on, the same in either theme */
    --brand-dark: #0e0d0d;
    --brand-light: #f1efea;
  }
  header,
  main {
    width: min(1080px, 100% - 2 * var(--space-4));
    margin: 0 auto;
  }
  header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-4) 0;
  }
  .home {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-text);
    text-decoration: none;
    font-weight: 600;
    font-size: 17px;
  }
  .button {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-height: 44px;
    padding: 0 var(--space-4);
    background: var(--color-accent);
    color: var(--color-accent-on);
    border-radius: var(--radius-control);
    text-decoration: none;
    font-weight: 600;
  }
  .button:hover {
    background: var(--color-accent-pressed);
  }
  .icon {
    display: flex;
  }
  .icon :global(svg) {
    width: 16px;
    height: 16px;
  }
  main {
    display: grid;
    gap: var(--space-7);
    padding: var(--space-6) 0 var(--space-7);
  }
  h1 {
    margin: 0;
    font-size: clamp(36px, 6vw, 52px);
    line-height: 1.05;
    font-weight: 700;
  }
  section {
    display: grid;
    gap: var(--space-4);
    min-width: 0;
  }
  h2 {
    margin: 0;
    font-size: 26px;
    font-weight: 600;
  }
  .logos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
    gap: var(--space-4);
  }
  .tile {
    display: grid;
    place-items: center;
    aspect-ratio: 16 / 10;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-control);
  }
  .tile.dark {
    background: var(--brand-dark);
  }
  .tile.light {
    background: var(--brand-light);
  }
  .tile img {
    width: 34%;
    height: auto;
  }
  .files {
    display: flex;
    gap: var(--space-4);
    margin: 0;
    font-size: 15px;
  }
  .colours {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--space-3);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .colours li {
    display: grid;
    gap: var(--space-2);
  }
  .swatch {
    height: 88px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-control);
  }
  code {
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--color-text-muted);
  }
  .font {
    margin: 0;
    font-size: clamp(24px, 4vw, 34px);
    line-height: 1.2;
    overflow-wrap: break-word;
  }
  .font.ui {
    font-family: var(--font-ui);
    font-weight: 600;
  }
  .font.editor {
    font-family: var(--font-editor);
    font-weight: 700;
  }
  .font.mono {
    font-family: var(--font-mono);
    font-weight: 500;
  }
  .shot {
    display: block;
    width: 100%;
    height: auto;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-window);
  }
</style>
