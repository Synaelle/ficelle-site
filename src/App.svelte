<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<script lang="ts">
  import Knot from '@app/ui/Knot.svelte'
  import Download from './Download.svelte'
  import { REPO } from './download'

  const base = import.meta.env.BASE_URL
</script>

<header class="top">
  <a class="brand" href="/">
    <Knot motion="tie" size={40} />
    <span>Ficelle</span>
  </a>
  <a class="repo" href={REPO}>GitHub</a>
</header>

<main>
  <section class="intro">
    <h1>A lightweight, private notes app for your computer and your phone.</h1>
    <Download />
  </section>

  <section class="screens" aria-label="Screenshots">
    <img
      class="desktop"
      src="{base}screens/desktop.png"
      alt="Ficelle on a computer, a note with headings, a task list and a table, beside the list of notes"
      width="1280"
      height="800"
    />
    <img
      class="phone"
      src="{base}screens/phone.png"
      alt="Ficelle on a phone, the list of notes"
      width="1080"
      height="2400"
    />
  </section>

  <section class="features">
    <h2>Features</h2>
    <ul>
      <li>
        Notes are Markdown, with a few extras, see <a href="{REPO}/blob/main/docs/markdown.md"
          >Markdown in notes</a
        >.
      </li>
      <li>Images work like in a word processor.</li>
      <li>Every note keeps its earlier versions.</li>
    </ul>
  </section>
</main>

<footer>
  <span>Made by <a href="https://github.com/Synaelle">Synaelle</a></span>
  <a href="{REPO}/blob/main/docs/privacy.md">Privacy</a>
  <a href="{REPO}/blob/main/CREDITS.md">Credits</a>
  <a href="{REPO}/blob/main/LICENSE">AGPL 3.0</a>
</footer>

<style>
  .top,
  main,
  footer {
    width: min(1120px, 100% - 2 * var(--space-4));
    margin: 0 auto;
  }
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-5) 0;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-text);
    font-weight: 700;
    font-size: 20px;
    text-decoration: none;
  }
  .repo {
    color: var(--color-text-muted);
    text-decoration: none;
  }
  .repo:hover {
    color: var(--color-text);
  }
  .intro {
    display: grid;
    gap: var(--space-6);
    padding: var(--space-7) 0 var(--space-6);
    max-width: 720px;
  }
  h1 {
    margin: 0;
    font-size: clamp(30px, 4.5vw, 46px);
    line-height: 1.12;
    font-weight: 700;
    letter-spacing: -0.01em;
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
  .features {
    padding: var(--space-7) 0;
    border-top: 1px solid var(--color-border);
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: var(--space-5);
  }
  h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .features ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--space-3);
    font-size: 18px;
  }
  .features li {
    padding-left: var(--space-4);
    border-left: 2px solid var(--color-accent);
  }
  footer {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-5);
    padding: var(--space-5) 0 var(--space-6);
    border-top: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: 14px;
  }
  footer span {
    margin-right: auto;
  }
  footer a {
    color: var(--color-text-muted);
  }
  footer a:hover {
    color: var(--color-text);
  }

  @media (max-width: 700px) {
    .intro {
      padding-top: var(--space-5);
    }
    .desktop {
      width: 100%;
    }
    .phone {
      position: static;
      width: 46%;
      margin: calc(-1 * var(--space-7)) var(--space-4) 0 auto;
    }
    .features {
      grid-template-columns: 1fr;
      gap: var(--space-3);
    }
  }
</style>
