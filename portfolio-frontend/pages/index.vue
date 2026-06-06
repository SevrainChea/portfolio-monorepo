<template>
  <AuroraLayout v-if="family === 'aurora'" />
  <NeonLayout v-else-if="family === 'neon'" />
</template>

<script setup lang="ts">
// One screen, rendered by the active family's layout. Each family is a distinct
// DOM layout consuming the shared content + --th-* tokens.
const { family } = useTheme();
</script>

<style scoped></style>
