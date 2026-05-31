<template>
  <AuroraLayout />
</template>

<script setup lang="ts">
// One screen, rendered by the active family's layout. Today that is always
// Aurora; when more families ship, switch on useTheme().family here.
const route = useRoute();
const router = useRouter();

onMounted(() => {
  if (!route.hash) {
    router.replace({ hash: "#about" });
  }
});
</script>

<style scoped></style>
