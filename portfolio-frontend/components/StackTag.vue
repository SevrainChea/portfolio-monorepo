<template>
  <span
    class="bg-tag-bg border-tag-border text-tag-text inline-block rounded-md border px-[11px] py-1 text-[11.5px] font-medium"
  >
    {{ text }}
  </span>
</template>

<script setup lang="ts">
defineProps<{
  text: string;
}>();
</script>

<style scoped></style>
