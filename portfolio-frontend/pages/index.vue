<template>
  <div
    class="text-fg-light flex h-full flex-col text-shadow-lg lg:flex-row lg:space-x-30"
  >
    <HeaderCard />
    <main class="text-fg-light space-y-8 pt-16 lg:pt-12">
      <AboutSection />
      <ExperiencesSection />
      <section id="projects" class="scroll-mt-24">projects</section>
      <footer>Footer</footer>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();

onMounted(() => {
  if (!route.hash) {
    router.replace({ hash: "#about" });
  }
});
</script>

<style scoped></style>
