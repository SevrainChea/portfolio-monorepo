<template>
  <div class="ph-switch" :class="{ cond: condensed, 'is-mobile': isMobile }">
    <div class="ph-row">
      <!-- Family selector + dropdown -->
      <div class="fam" :class="{ open: menuOpen }">
        <button
          type="button"
          class="fam-trigger"
          aria-haspopup="menu"
          :aria-expanded="menuOpen"
          @click.stop="menuOpen = !menuOpen"
        >
          <span class="lbl">Theme</span>
          <span class="val"
            >{{ currentFamily.name }}<span class="chev">▾</span></span
          >
        </button>
        <div v-if="menuOpen" class="ph-menu" role="menu" @click.stop>
          <button
            v-for="f in families"
            :key="f.id"
            type="button"
            role="menuitem"
            @click="pickFamily(f.id)"
          >
            <span
              class="dot"
              :style="swatchGradient(f.variants[0].swatch[currentMode])"
            />
            <span class="mname">{{ f.name }}</span>
            <span v-if="f.id === family" class="ck">✓</span>
            <span v-else class="msub">{{ f.sub }}</span>
          </button>
          <button
            v-for="u in upcoming"
            :key="u.id"
            type="button"
            role="menuitem"
            class="soon"
            disabled
          >
            <span class="dot dot-muted" />
            <span class="mname">{{ u.name }}</span>
            <span class="badge">Soon</span>
          </button>
        </div>
      </div>

      <div class="sep" />

      <!-- Variant swatches. Active ring + dot colors are CSS-driven off the
           <html> data-variant / .dark attributes (set pre-paint by the inline
           theme script), so they never flash the default on reload. -->
      <div class="swatches">
        <button
          v-for="v in currentFamily.variants"
          :key="v.id"
          class="sw"
          :data-variant="v.id"
          :aria-label="v.name"
          :aria-pressed="v.id === currentVariant"
          @click="setVariant(v.id)"
        >
          <span class="dot" :style="swatchVars(v.swatch)" />
          <span class="tip">{{ v.name }}</span>
        </button>
      </div>

      <div class="sep" />

      <!-- Light / dark toggle. Both icons render; CSS shows the right one based
           on the .dark class, so the icon is correct on the first frame. -->
      <button
        class="mode"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="toggleMode"
      >
        <Icon name="uil:sun" class="ic ic-sun" size="17" aria-hidden="true" />
        <Icon name="uil:moon" class="ic ic-moon" size="17" aria-hidden="true" />
      </button>
    </div>

    <!-- Mobile-only condensed nav row -->
    <nav class="ph-nav">
      <div class="mini">
        <img :src="data.photo" :alt="data.name" />
        <span class="nm">{{ data.name }}</span>
      </div>
      <NuxtLink
        v-for="(item, i) in data.nav"
        :key="item.href"
        :to="linkTo(item.href)"
        :class="{ active: i === 0 }"
        @click="menuOpen = false"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import {
  UPCOMING_FAMILIES,
  ALL_VARIANT_IDS,
  type FamilyId,
} from "~/composables/useTheme";

const data = usePortfolioData();
const {
  families,
  family,
  currentFamily,
  currentVariant,
  currentMode,
  isDark,
  setFamily,
  setVariant,
  toggleMode,
} = useTheme();

const upcoming = UPCOMING_FAMILIES;

// Active-ring rule generated from the registry, so it covers every variant of
// every family with no hardcoded ids. It matches the <html data-variant> that
// the inline script sets pre-paint, so the ring is flash-free on reload and
// auto-extends whenever a family is added to the registry.
const activeRingCss =
  ALL_VARIANT_IDS.map(
    (id) => `html[data-variant="${id}"] .ph-switch .sw[data-variant="${id}"]`,
  ).join(",") + "{box-shadow:0 0 0 2px var(--th-accent);border-radius:50%}";
useHead({ style: [{ innerHTML: activeRingCss, key: "ph-active-ring" }] });

const menuOpen = ref(false);
const condensed = ref(false);
// The pill collapses to a full-width sticky header at the ACTIVE family's own
// registry breakpoint (Aurora 880; Neon/Editorial/Blueprint 760) — not a single
// hardcoded width — so the switcher flips in lockstep with each family's layout.
// Set in onMounted (before first paint, like `condensed`), so there's no flash.
const isMobile = ref(false);
const updateMobile = () => {
  isMobile.value = window.innerWidth <= currentFamily.value.breakpoint;
};

// Single gradient — used by the family dropdown, which only renders once opened
// (post-mount), so it can safely depend on reactive currentMode.
function swatchGradient([c0, c1]: [string, string]) {
  return { background: `linear-gradient(135deg, ${c0} 45%, ${c1} 45%)` };
}

// Both mode gradients as static custom props; CSS picks one off the .dark class
// (set pre-paint by the inline script), so swatch colors never flash on reload.
function swatchVars(swatch: {
  dark: [string, string];
  light: [string, string];
}) {
  return {
    "--sw-d": `linear-gradient(135deg, ${swatch.dark[0]} 45%, ${swatch.dark[1]} 45%)`,
    "--sw-l": `linear-gradient(135deg, ${swatch.light[0]} 45%, ${swatch.light[1]} 45%)`,
  };
}

function linkTo(href: string) {
  return href.startsWith("#") ? { hash: href } : href;
}

function pickFamily(id: FamilyId) {
  setFamily(id);
  menuOpen.value = false;
}

const onScroll = () => (condensed.value = window.scrollY > 96);
const onDocClick = () => (menuOpen.value = false);
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") menuOpen.value = false;
};

// Re-evaluate when the family changes — breakpoints differ per family.
watch(currentFamily, updateMobile);

onMounted(() => {
  onScroll();
  updateMobile();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateMobile, { passive: true });
  window.addEventListener("click", onDocClick);
  window.addEventListener("keydown", onKeydown);
});
onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", updateMobile);
  window.removeEventListener("click", onDocClick);
  window.removeEventListener("keydown", onKeydown);
});
</script>

<style scoped>
.ph-switch {
  position: fixed;
  top: 22px;
  right: 24px;
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 9px 9px 9px 16px;
  border-radius: 999px;
  font-family: var(--font-inter);
  box-shadow: 0 10px 34px -16px rgba(0, 0, 0, 0.7);
  /* accent follows the active theme token (set pre-paint via <html> attrs) */
  --acc: var(--th-accent);
  transition:
    background 0.45s ease,
    border-color 0.45s ease,
    color 0.45s ease;
}
/* Chrome (glass) is driven by the .dark class on <html>, which the pre-paint
   inline script sets — so the pill never flashes the wrong chrome on reload. */
html.dark .ph-switch {
  background: rgba(13, 15, 21, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #fff;
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
}
html:not(.dark) .ph-switch {
  background: rgba(252, 251, 248, 0.93);
  border: 1px solid rgba(20, 20, 30, 0.12);
  color: #171310;
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
}

.ph-row {
  display: contents;
}

.fam {
  position: relative;
}
.fam-trigger {
  display: flex;
  align-items: center;
  gap: 9px;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
  user-select: none;
}
.fam .lbl {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.5;
}
.fam .val {
  font-family: var(--font-playfair-display);
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.fam .val .chev {
  font-family: var(--font-inter);
  font-size: 9px;
  opacity: 0.55;
  transition: transform 0.2s;
}
.fam.open .val .chev {
  transform: rotate(180deg);
}

.sep {
  width: 1px;
  height: 22px;
}
html.dark .ph-switch .sep {
  background: rgba(255, 255, 255, 0.18);
}
html:not(.dark) .ph-switch .sep {
  background: rgba(20, 20, 30, 0.14);
}

.swatches {
  display: flex;
  align-items: center;
  gap: 7px;
}
.sw {
  position: relative;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  border: none;
  background: transparent;
  display: grid;
  place-items: center;
}
.sw .dot,
.fam .dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.22);
  transition: transform 0.2s;
}
/* swatch dot color: dark gradient by default, light gradient when html is light */
.sw .dot {
  background: var(--sw-d);
}
html:not(.dark) .sw .dot {
  background: var(--sw-l);
}
.sw:hover .dot {
  transform: scale(1.14);
}
/* active ring is injected via useHead (generated from the registry) so it
   covers every variant without hardcoded ids — see <script>. */
.sw .tip {
  position: absolute;
  top: 34px;
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  white-space: nowrap;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 9px;
  border-radius: 7px;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.18s,
    transform 0.18s;
}
html.dark .ph-switch .sw .tip {
  color: #fff;
  background: rgba(8, 9, 13, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.14);
}
html:not(.dark) .ph-switch .sw .tip {
  color: #171310;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(20, 20, 30, 0.12);
  box-shadow: 0 6px 18px -8px rgba(0, 0, 0, 0.4);
}
.sw:hover .tip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.mode {
  position: relative;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  display: grid;
  place-items: center;
  padding: 0;
  background: transparent;
  transition:
    border-color 0.25s,
    color 0.25s;
}
html.dark .ph-switch .mode {
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
}
html:not(.dark) .ph-switch .mode {
  border: 1px solid rgba(20, 20, 30, 0.18);
  color: #171310;
}
.mode:hover {
  border-color: var(--acc);
  color: var(--acc);
}
/* sun shown in dark (switch to light), moon shown in light (switch to dark) */
.mode .ic-moon {
  display: none;
}
html:not(.dark) .mode .ic-sun {
  display: none;
}
html:not(.dark) .mode .ic-moon {
  display: inline-flex;
}

/* Keyboard focus indicator for all interactive controls */
.fam-trigger:focus-visible,
.sw:focus-visible,
.mode:focus-visible,
.ph-menu button:focus-visible {
  outline: 2px solid var(--acc);
  outline-offset: 2px;
}

/* Dropdown menu — right-aligned to the trigger so it opens leftward and never
   runs off the right viewport edge (the pill is pinned top-right, and a short
   active-family name like "Neon" makes the pill narrow, pushing the trigger
   far right). Mobile re-anchors it left (full-width header). */
.ph-menu {
  position: absolute;
  top: 40px;
  right: -4px;
  left: auto;
  min-width: 190px;
  padding: 6px;
  border-radius: 13px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 70;
}
html.dark .ph-switch .ph-menu {
  background: rgba(15, 17, 23, 0.97);
  border: 1px solid rgba(255, 255, 255, 0.13);
  box-shadow: 0 18px 44px -14px rgba(0, 0, 0, 0.8);
}
html:not(.dark) .ph-switch .ph-menu {
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(20, 20, 30, 0.1);
  box-shadow: 0 18px 44px -14px rgba(0, 0, 0, 0.32);
}
.ph-menu button {
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 11px;
  border-radius: 9px;
  cursor: pointer;
  font-size: 13.5px;
  width: 100%;
  transition: background 0.15s;
}
html.dark .ph-switch .ph-menu button:hover {
  background: rgba(255, 255, 255, 0.07);
}
html:not(.dark) .ph-switch .ph-menu button:hover {
  background: rgba(20, 20, 30, 0.05);
}
.ph-menu button .dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1.5px solid rgba(128, 128, 128, 0.3);
}
.ph-menu button .dot-muted {
  background: rgba(128, 128, 128, 0.35);
}
.ph-menu button .mname {
  font-family: var(--font-playfair-display);
  font-size: 14.5px;
}
.ph-menu button .msub {
  margin-left: auto;
  font-size: 10px;
  opacity: 0.5;
  letter-spacing: 0.04em;
}
.ph-menu button .ck {
  margin-left: auto;
  color: var(--acc);
  font-size: 12px;
}
.ph-menu button.soon {
  opacity: 0.45;
  cursor: default;
}
.ph-menu button.soon .badge {
  margin-left: auto;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid currentColor;
  border-radius: 5px;
  padding: 2px 5px;
  opacity: 0.7;
}

/* Desktop: nav row hidden */
.ph-nav {
  display: none;
}
.mini {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}
.mini img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex: 0 0 auto;
  border: 1px solid var(--th-accent);
}
.mini .nm {
  font-family: var(--font-playfair-display);
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ════════ MOBILE: switcher becomes a full-width sticky header ════════ */
/* Triggered per-family at its own registry breakpoint (Aurora 880; Neon /
   Editorial / Blueprint 760) via the JS-toggled .is-mobile class, so the header
   flips in lockstep with each family's own mobile layout instead of one
   hardcoded width. The class is set in onMounted (before first paint, like
   .cond), so there's no desktop-pill flash. */
.ph-switch.is-mobile {
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  box-sizing: border-box;
  border-radius: 0;
  border-width: 0 0 1px;
  flex-direction: column;
  align-items: stretch;
  gap: 0;
  padding: 0;
  box-shadow: 0 6px 22px -14px rgba(0, 0, 0, 0.7);
}
.ph-switch.is-mobile .ph-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 13px;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  position: relative;
}
.ph-switch.is-mobile .fam {
  flex: 0 0 auto;
  /* relative (default) so the dropdown anchors to the trigger and visually
     drops from the pill, rather than floating at the header's right edge. */
}
.ph-switch.is-mobile .fam .lbl {
  display: none;
}
.ph-switch.is-mobile .sw {
  width: 25px;
  height: 25px;
}
.ph-switch.is-mobile .sw .dot {
  width: 19px;
  height: 19px;
}
.ph-switch.is-mobile .sw .tip {
  display: none;
}
.ph-switch.is-mobile .mode {
  width: 33px;
  height: 33px;
}
/* Drop the menu from the trigger (left-aligned, opening down-right) so it reads
   as hanging off the pill. The trigger sits roughly centered in the bar, so a
   190px menu opening rightward stays within the viewport at mobile widths. */
.ph-switch.is-mobile .ph-menu {
  top: calc(100% + 14px);
  left: 0;
  right: auto;
}
.ph-switch.is-mobile .ph-nav {
  display: flex;
  /* explicit row: .ph-nav is a <nav> nested in each layout's root, so a layout's
     bare `nav` selector (e.g. Aurora's column sidebar nav) must not flip it. */
  flex-direction: row;
  align-items: center;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  padding: 0 12px;
  transition:
    max-height 0.3s ease,
    opacity 0.26s ease,
    padding 0.3s ease;
}
.ph-switch.is-mobile.cond .ph-nav {
  max-height: 56px;
  opacity: 1;
  padding: 8px 12px;
  border-top: 1px solid;
}
html.dark .ph-switch.is-mobile.cond .ph-nav {
  border-top-color: rgba(255, 255, 255, 0.12);
}
html:not(.dark) .ph-switch.is-mobile.cond .ph-nav {
  border-top-color: rgba(20, 20, 30, 0.1);
}
.ph-switch.is-mobile .ph-nav .mini {
  flex: 0 0 auto;
}
.ph-switch.is-mobile .ph-nav .mini .nm {
  max-width: 92px;
}
.ph-switch.is-mobile .ph-nav a {
  flex: 1;
  text-align: center;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-decoration: none;
  color: inherit;
  padding: 8px 6px;
  border-radius: 8px;
  transition: background 0.15s;
}
.ph-switch.is-mobile .ph-nav a.active {
  color: var(--th-accent);
}
html.dark .ph-switch.is-mobile .ph-nav a {
  background: rgba(255, 255, 255, 0.06);
}
html:not(.dark) .ph-switch.is-mobile .ph-nav a {
  background: rgba(20, 20, 30, 0.05);
}
</style>
