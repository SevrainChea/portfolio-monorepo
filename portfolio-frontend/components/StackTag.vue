<template>
  <div
    class="bg-primary/80 text-primary-bg1 rounded-lg px-2 py-1 text-sm font-semibold shadow-lg"
  >
    {{ text }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  text: string;
}>();
</script>

<style scoped></style>
