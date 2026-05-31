<template>
  <section id="about" class="scroll-mt-24 space-y-2">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-for="(paragraph, i) in data.about" :key="i" v-html="paragraph" />
  </section>
</template>

<script setup lang="ts">
const data = usePortfolioData();
</script>

<style scoped></style>
