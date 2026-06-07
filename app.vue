<template>
  <div>
    <!-- Aurora ships a shared fixed background; every other family draws its own
         background inside its layout component, so gate this to Aurora only. -->
    <AuroraBackground v-if="family === 'aurora'" />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";

// data-family / data-variant are written onto <html> by plugins/random-theme
// (via useHead, on both SSR and live changes). The light/dark mode, however, is
// resolved client-side (OS preference, known only after mount) — the inline FOUC
// script sets it before paint, and here we keep it in sync with reactive state
// for live toggles. immediate:false so we never clobber the script's pre-paint
// value with the SSR default before systemMode is detected in useTheme onMounted.
const { family, currentMode } = useTheme();

if (import.meta.client) {
  watch(
    currentMode,
    (m) => {
      const el = document.documentElement;
      el.classList.toggle("dark", m === "dark");
      el.style.colorScheme = m;
    },
    { immediate: false },
  );
}
</script>

<style></style>
