# CLAUDE.md

Guidance for Claude Code when working in `portfolio-frontend`. This file is a
lean index — detailed conventions live in `docs/conventions/` and are linked
below. **Read the relevant convention file before changing code in that area.**

## Project Overview

Personal portfolio for a Tech Lead / Full-Stack Engineer, built with **Nuxt 3 +
Vue 3 (Composition API, `<script setup lang="ts">`) + TailwindCSS v4**.

The live site is a single screen: `pages/index.vue` switches on the active
**family** to render the matching `*Layout.vue` (Aurora / Neon / Editorial /
Blueprint). The whole UI is driven by a multi-theme system (family → variant →
light/dark) whose single source of truth is `theme-registry.ts`. `pages/chat.vue`
is the RAG chatbot page; it mirrors that pattern, switching on `family` to render
the matching per-family `*Chat.vue` skin over a shared `useChat()` composable.

> **Deprecated — do not extend:** glass morphism / "glass-ui" (`GlassCard.vue`,
> `backdrop-blur` card surfaces) and `BgGradient.vue` are now **unreferenced dead
> code** (GlassCard's last consumer, `chat.vue`, was replaced by the `*Chat.vue`
> skins). New work uses the token-driven per-family system instead. See
> [styling-and-themes.md](docs/conventions/styling-and-themes.md).

## Commands

Package manager is **pnpm** (v10.11.1); Node is pinned in `.nvmrc` (v22.16.0).

- `pnpm dev` — dev server at localhost:3000 (the user keeps one running; **do
  not start your own** — changes hot-reload)
- `pnpm build` / `pnpm generate` / `pnpm preview`

No test framework or linter is configured. Formatting is **Prettier** with
`prettier-plugin-tailwindcss` (defaults: 2-space, double quotes, semicolons,
trailing commas).

## Architecture at a glance

- `app.vue` — renders `<AuroraBackground>` + `<NuxtPage>`; syncs reactive theme
  state onto `<html>` attributes (`data-family` / `data-variant` / `.dark`).
- `nuxt.config.ts` — injects a **render-blocking inline script** that sets those
  `<html>` attributes pre-paint to avoid a flash of the default theme (FOUC).
- `theme-registry.ts` — dependency-free single source of truth for families,
  variants, defaults, and storage keys (shared by `useTheme` AND the FOUC
  script so they can't drift).
- `composables/useTheme.ts` — reactive, persisted theme state.
- `composables/usePortfolioData.ts` — all site content (typed, hardcoded).
- `assets/css/tailwind.css` — `@theme` token map + the theme registry CSS
  (every variant/mode is a selector block re-setting `--th-*` role tokens).

## Conventions (read before editing)

- [code-style.md](docs/conventions/code-style.md) — TS, `<script setup>`,
  imports/auto-imports, comments, formatting.
- [components.md](docs/conventions/components.md) — component patterns, props,
  accessibility, the two styling approaches, what's deprecated.
- [styling-and-themes.md](docs/conventions/styling-and-themes.md) — the `--th-*`
  token contract, adding a variant or a family, the FOUC/hydration rules.
- [composables-data.md](docs/conventions/composables-data.md) — editing site
  content, the data model, `useTheme` API.

## Git workflow notes

- After `git checkout` switches branches, the Edit tool's file cache goes stale
  — re-read files before editing.
- Force-delete (`git branch -D`) is needed for branches never merged into
  `main`.
