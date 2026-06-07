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

// The initial <html> theme attributes are written by a render-blocking inline
// script (see nuxt.config app.head) so a stored non-default theme paints
// correctly on the first frame — no flash of the default. Here we only keep
// those attributes in sync with reactive state for live theme changes.
// immediate:false so we never overwrite the script's values with the SSR
// defaults before localStorage hydration (which happens in useTheme onMounted).
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
