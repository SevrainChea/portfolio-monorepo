<template>
  <NuxtLink
    :to="props.url"
    target="_blank"
    class="hover:text-fg-highlight text-fg-muted inline-flex items-center gap-1 transition-colors"
  >
    <Icon name="uil:link" />
    {{ props.name }}
  </NuxtLink>
</template>

<script setup lang="ts">
export interface ExperienceProjectLinkProps {
  name: string;
  url: string;
}

const props = defineProps<ExperienceProjectLinkProps>();
</script>

<style scoped></style>
