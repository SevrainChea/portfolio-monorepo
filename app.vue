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

// The initial <html> theme attributes are written by the render-blocking inline
// script (see nuxt.config app.head): it picks the random family/variant and sets
// data-family / data-variant / .dark before first paint. plugins/random-theme
// seeds the same values into reactive state so the first render matches. Here we
// only keep <html> in sync with reactive state for live theme changes (the
// switcher). immediate:false so we never clobber the script's pre-paint values.
const { family, currentVariant, currentMode } = useTheme();

if (import.meta.client) {
  watch(
    [family, currentVariant, currentMode],
    ([f, v, m]) => {
      const el = document.documentElement;
      el.setAttribute("data-family", f);
      el.setAttribute("data-variant", v);
      el.classList.toggle("dark", m === "dark");
      el.style.colorScheme = m;
    },
    { immediate: false },
  );
}
</script>

<style></style>
