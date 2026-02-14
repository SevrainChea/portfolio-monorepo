<template>
  <footer class="border-t border-white/10 pt-8 pb-8">
    <div class="flex flex-col items-center gap-6">
      <!-- Social links -->
      <div class="flex items-center gap-6">
        <a
          v-for="link in links"
          :key="link.label"
          :href="link.url"
          :aria-label="link.label"
          target="_blank"
          rel="noopener noreferrer"
          class="text-fg-muted hover:text-fg-highlight transition-colors duration-300"
        >
          <Icon :name="link.icon" size="22" />
        </a>
      </div>

      <!-- Divider -->
      <div class="h-px w-16 bg-white/10" />

      <!-- Built with -->
      <p class="text-fg-muted text-center text-xs leading-relaxed">
        Designed &amp; built by
        <span class="text-fg-light font-semibold">Sévrain CHEA</span>
        · Nuxt 3 &amp; TailwindCSS
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const links = [
  {
    label: "GitHub",
    url: "https://github.com/SevrainChea",
    icon: "uil:github",
  },
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/sevrainchea/",
    icon: "uil:linkedin",
  },
  {
    label: "Email",
    url: "mailto:sevrain.chea@gmail.com",
    icon: "uil:envelope",
  },
];
</script>

<style scoped></style>
