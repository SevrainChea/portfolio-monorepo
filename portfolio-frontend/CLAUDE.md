# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for a Full-Stack Engineer/Tech Lead, built with Nuxt 3 and TailwindCSS v4. Currently in early development — some sections (projects, footer) are placeholders.

## Commands

- `pnpm dev` — Start dev server (localhost:3000)
- `pnpm build` — Production build
- `pnpm generate` — Static site generation
- `pnpm preview` — Preview production build

Package manager is **pnpm** (v10.11.1). Node version is pinned in `.nvmrc` (v22.16.0). No test framework or linter is configured; formatting uses Prettier with `prettier-plugin-tailwindcss`.

## Architecture

**Framework:** Nuxt 3 with Vue 3 Composition API (`<script setup lang="ts">`) and TypeScript.

**Rendering:** Single-page app structure — `app.vue` renders `<BgGradient>` (animated background) and `<NuxtPage>`, with `pages/index.vue` as the only page. No layouts directory; no middleware; no composables directory (only built-in Nuxt auto-imports used).

**Styling:** TailwindCSS v4 loaded as a Vite plugin (`@tailwindcss/vite`). Custom theme variables (colors, sizes) are defined in `assets/css/tailwind.css` using CSS `@theme`. Global font (Playfair Display) is set in `assets/css/main.css`.

**Component patterns:**
- `GlassCard.vue` — Reusable glass-morphism container using dynamic component rendering (`is` prop) and `v-bind="$attrs"` forwarding. Used as wrapper in multiple sections.
- `BgGradient.vue` — Full-screen animated gradient with SVG goo filter, mouse-tracking interactive circle, and CSS keyframe animations.
- `ExperiencesSection.vue` — Contains hardcoded experience data array; renders `ExperienceCard` components.
- Props use TypeScript interfaces with `defineProps` and `withDefaults`.

**Modules:** `@nuxt/image` for image optimization, `@nuxt/icon` for Iconify icons.

**Data:** All content (experiences, about text) is hardcoded in components — no CMS, API, or data layer.

## Design Tokens (`assets/css/tailwind.css`)

All visual design variables live in the `@theme` block:

- `--color-circleN` (1–5): RGB triplets **without** `rgb()` wrapper — consumed as `rgba(var(--color-circleN), 0.8)` in `BgGradient.vue`. Changing these controls the animated bubble colors.
- `--color-interactive`: Same RGB triplet format, controls the mouse-tracking bubble.
- `--blending`: CSS `mix-blend-mode` applied to all bubbles (currently `overlay`).
- `--circle-size`: Size of each bubble circle (currently `90%`).
- Background gradient colors: `--color-primary-bg1/2/3` (deep navy/purple tones).

**Current bubble palette (twilight-cool):**
```
circle1: 35, 75, 130   /* cool slate blue */
circle2: 155, 40, 95   /* cool burgundy */
circle3: 85, 40, 145   /* cool violet */
circle4: 25, 115, 105  /* cool teal */
circle5: 175, 85, 35   /* cool amber */
interactive: 50, 130, 195  /* cool sky */
```

## Git Workflow Notes

- When switching branches with `git checkout`, the Edit tool's file cache becomes stale — always re-read files after a branch switch before editing.
- Force-delete (`git branch -D`) is needed for branches never merged into `main`.
