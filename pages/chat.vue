<template>
  <AuroraChat v-if="family === 'aurora'" />
  <NeonChat v-else-if="family === 'neon'" />
  <EditorialChat v-else-if="family === 'editorial'" />
  <BlueprintChat v-else-if="family === 'blueprint'" />
</template>

<script setup lang="ts">
// One dedicated chat screen, rendered by the active family's skin. Each skin is
// a distinct DOM consuming the shared useChat() behavior + --th-* tokens.
const { family } = useTheme();
</script>

<style scoped></style>
