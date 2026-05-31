<template>
  <div>
    <AuroraBackground />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";

// useTheme() owns the theme state; these drive the root <html> attributes.
const { family, currentVariant, currentMode, isDark } = useTheme();

// data-* attributes + the initial SSR class come from useHead (attribute-value
// changes reconcile reliably through unhead).
useHead({
  htmlAttrs: {
    "data-family": () => family.value,
    "data-variant": () => currentVariant.value,
    class: () => (currentMode.value === "dark" ? "dark" : ""),
    style: () => `color-scheme:${currentMode.value}`,
  },
});

// unhead does NOT reliably REMOVE the `.dark` class token on a reactive update
// (switching to light left the page dark). Toggle it imperatively on the client
// to guarantee correctness. Runs after hydration, so there is no SSR mismatch.
if (import.meta.client) {
  watch(
    isDark,
    (dark) => {
      document.documentElement.classList.toggle("dark", dark);
    },
    { immediate: true },
  );
}
</script>

<style></style>
