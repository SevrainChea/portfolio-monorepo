<template>
  <GlassCard
    class="group/experience-card text-fg-muted grid cursor-pointer grid-cols-[auto_1fr] gap-4 !p-4 max-lg:border-white/20 max-lg:bg-black/40 max-lg:backdrop-blur-xl"
    component="a"
    :glassOnHover="true"
    :href="companyLink"
    target="_blank"
    rel="noopener noreferrer"
  >
    <div class="flex flex-col items-center">
      <div v-for="date in dates">
        <span class="">{{ date }}</span>
      </div>
    </div>
    <div class="flex flex-col">
      <div class="flex items-center gap-1">
        <span class="text-fg-light">
          <span
            class="lg:group-hover/experience-card:text-fg-highlight transition-colors"
            >{{ title }}</span
          >
          · <span class="text-fg-muted">{{ contract }}</span>
        </span>
        <Icon
          name="uil:external-link-alt"
          class="transition-transform lg:group-hover/experience-card:translate-x-1 lg:group-hover/experience-card:-translate-y-1"
        />
      </div>
      <ol v-if="positions">
        <li v-for="(position, index) in positions" :key="index" class="text-sm">
          {{ position }}
        </li>
      </ol>
      <p class="text-fg-light mt-2 text-sm">{{ description }}</p>
      <div>
        <ExperienceProjectLink
          v-for="(project, index) in projectLinks"
          :key="index"
          :name="project.name"
          :url="project.url"
        />
      </div>

      <div class="mt-2 flex flex-wrap gap-2">
        <StackTag v-for="(tag, index) in stack" :key="index" :text="tag" />
      </div>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
export interface ExperienceCardProps {
  title: string;
  contract: string;
  positions?: string[];
  description: string;
  dates: string[];
  stack: string[];
  companyLink?: string;
  projectLinks?: {
    name: string;
    url: string;
  }[];
}

const props = defineProps<ExperienceCardProps>();
</script>

<style scoped></style>
