<template>
  <button
    @click="toggleDarkMode"
    class="text-fg-muted hover:text-fg-highlight flex cursor-pointer items-center justify-center transition-colors duration-300"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="rotate-180 scale-0 opacity-0"
      enter-to-class="rotate-0 scale-100 opacity-100"
      leave-active-class="transition-all duration-300 absolute"
      leave-from-class="rotate-0 scale-100 opacity-100"
      leave-to-class="-rotate-180 scale-0 opacity-0"
      mode="out-in"
    >
      <Icon v-if="isDark" name="uil:sun" :size="size" key="sun" />
      <Icon v-else name="uil:moon" :size="size" key="moon" />
    </Transition>
  </button>
</template>

<script setup lang="ts">
import { useGlaceTheme } from "@glace-ui/vue";

withDefaults(
  defineProps<{
    size?: string;
  }>(),
  {
    size: "20",
  },
);

const { isDark, toggleDarkMode } = useGlaceTheme();
</script>
