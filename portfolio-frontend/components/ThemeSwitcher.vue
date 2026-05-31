<template>
  <div
    class="ph-switch"
    :class="{ 'is-mobile': isMobile, cond: condensed }"
    :data-chrome="currentMode"
    :style="{ '--acc': accent }"
  >
    <div class="ph-row">
      <!-- Family selector + dropdown -->
      <div class="fam" :class="{ open: menuOpen }" @click.stop="menuOpen = !menuOpen">
        <span class="lbl">Theme</span>
        <span class="val">{{ currentFamily.name }}<span class="chev">▾</span></span>
        <div v-if="menuOpen" class="ph-menu" @click.stop>
          <button
            v-for="f in families"
            :key="f.id"
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
          <button v-for="u in upcoming" :key="u.id" class="soon" disabled>
            <span class="dot dot-muted" />
            <span class="mname">{{ u.name }}</span>
            <span class="badge">Soon</span>
          </button>
        </div>
      </div>

      <div class="sep" />

      <!-- Variant swatches -->
      <div class="swatches">
        <button
          v-for="v in currentFamily.variants"
          :key="v.id"
          class="sw"
          :class="{ active: v.id === currentVariant }"
          :aria-label="v.name"
          @click="setVariant(v.id)"
        >
          <span class="dot" :style="swatchGradient(v.swatch[currentMode])" />
          <span class="tip">{{ v.name }}</span>
        </button>
      </div>

      <div class="sep" />

      <!-- Light / dark toggle -->
      <button
        class="mode"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="toggleMode"
      >
        <Icon :name="isDark ? 'uil:sun' : 'uil:moon'" size="17" />
      </button>
    </div>

    <!-- Mobile-only condensed nav row -->
    <nav class="ph-nav">
      <div class="mini">
        <img :src="data.photo" :alt="data.name" :style="{ borderColor: accent }" />
        <span class="nm">{{ data.name }}</span>
      </div>
      <NuxtLink
        v-for="(item, i) in data.nav"
        :key="item.href"
        :to="linkTo(item.href)"
        :style="i === 0 ? { color: accent } : undefined"
        @click="menuOpen = false"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { UPCOMING_FAMILIES, type FamilyId } from "~/composables/useTheme";

const data = usePortfolioData();
const {
  families,
  family,
  currentFamily,
  currentVariant,
  currentMode,
  isDark,
  accent,
  setFamily,
  setVariant,
  toggleMode,
} = useTheme();

const upcoming = UPCOMING_FAMILIES;
const menuOpen = ref(false);
const condensed = ref(false);
const winW = ref(1200); // desktop default for SSR; corrected on mount

const isMobile = computed(() => winW.value <= currentFamily.value.breakpoint);

function swatchGradient([c0, c1]: [string, string]) {
  return { background: `linear-gradient(135deg, ${c0} 45%, ${c1} 45%)` };
}

function linkTo(href: string) {
  return href.startsWith("#") ? { hash: href } : href;
}

function pickFamily(id: FamilyId) {
  setFamily(id);
  menuOpen.value = false;
}

const onResize = () => (winW.value = window.innerWidth);
const onScroll = () => (condensed.value = window.scrollY > 96);
const onDocClick = () => (menuOpen.value = false);

onMounted(() => {
  onResize();
  onScroll();
  window.addEventListener("resize", onResize);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("click", onDocClick);
});
onUnmounted(() => {
  window.removeEventListener("resize", onResize);
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("click", onDocClick);
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
  transition:
    background 0.45s ease,
    border-color 0.45s ease,
    color 0.45s ease;
}
.ph-switch[data-chrome="dark"] {
  background: rgba(13, 15, 21, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #fff;
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
}
.ph-switch[data-chrome="light"] {
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
  display: flex;
  align-items: center;
  gap: 9px;
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
.ph-switch[data-chrome="dark"] .sep {
  background: rgba(255, 255, 255, 0.18);
}
.ph-switch[data-chrome="light"] .sep {
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
.sw:hover .dot {
  transform: scale(1.14);
}
.sw.active {
  box-shadow: 0 0 0 2px var(--acc);
  border-radius: 50%;
}
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
.ph-switch[data-chrome="dark"] .sw .tip {
  color: #fff;
  background: rgba(8, 9, 13, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.14);
}
.ph-switch[data-chrome="light"] .sw .tip {
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
  transition: all 0.25s;
}
.ph-switch[data-chrome="dark"] .mode {
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
}
.ph-switch[data-chrome="light"] .mode {
  border: 1px solid rgba(20, 20, 30, 0.18);
  color: #171310;
}
.mode:hover {
  border-color: var(--acc);
  color: var(--acc);
}

/* Dropdown menu */
.ph-menu {
  position: absolute;
  top: 40px;
  left: -4px;
  min-width: 190px;
  padding: 6px;
  border-radius: 13px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 70;
}
.ph-switch[data-chrome="dark"] .ph-menu {
  background: rgba(15, 17, 23, 0.97);
  border: 1px solid rgba(255, 255, 255, 0.13);
  box-shadow: 0 18px 44px -14px rgba(0, 0, 0, 0.8);
}
.ph-switch[data-chrome="light"] .ph-menu {
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
.ph-switch[data-chrome="dark"] .ph-menu button:hover {
  background: rgba(255, 255, 255, 0.07);
}
.ph-switch[data-chrome="light"] .ph-menu button:hover {
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
  border: 1px solid currentColor;
}
.mini .nm {
  font-family: var(--font-playfair-display);
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ════════ MOBILE: full-width sticky header ════════ */
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
.ph-switch.is-mobile .ph-menu {
  top: 46px;
  left: 0;
}
.ph-switch.is-mobile .ph-nav {
  display: flex;
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
.ph-switch.is-mobile[data-chrome="dark"].cond .ph-nav {
  border-top-color: rgba(255, 255, 255, 0.12);
}
.ph-switch.is-mobile[data-chrome="light"].cond .ph-nav {
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
.ph-switch.is-mobile[data-chrome="dark"] .ph-nav a {
  background: rgba(255, 255, 255, 0.06);
}
.ph-switch.is-mobile[data-chrome="light"] .ph-nav a {
  background: rgba(20, 20, 30, 0.05);
}
</style>
