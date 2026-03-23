<template>
  <div class="">
    <BgGradient />
    <div
      class="z-[100] h-screen w-screen overflow-hidden px-10 opacity-95 xl:px-32"
    >
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlaceTheme } from "@glace-ui/vue";
import { watch } from "vue";

const { isDark } = useGlaceTheme({
  darkMode: true,
});

watch(
  isDark,
  (dark) => {
    if (!document) return;
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  },
  { immediate: true },
);
</script>

<style></style>
