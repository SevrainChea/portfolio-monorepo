<template>
  <section id="experiences" class="scroll-mt-24">
    <ol class="group/list flex flex-col gap-4">
      <ExperienceCard
        class="lg:group-hover/list:opacity-50 lg:hover:!opacity-100"
        v-for="experience in experiences"
        :key="experience.title"
        v-bind="experience"
      />
    </ol>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ExperienceCardProps } from "./ExperienceCard.vue";

const data = usePortfolioData();

// Adapt the shared content model to ExperienceCard's prop shape.
const experiences = computed<ExperienceCardProps[]>(() =>
  data.experiences.map((e) => ({
    title: `${e.title} @${e.company}`,
    contract: e.contract,
    positions: e.positions,
    description: e.description,
    dates: [e.dates, `(${e.duration})`],
    stack: e.stack,
    companyLink: e.companyLink,
    projectLinks: e.projectLinks,
  })),
);
</script>

<style scoped></style>
