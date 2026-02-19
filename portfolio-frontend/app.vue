<script setup>
import { Analytics } from "@vercel/analytics/nuxt";
</script>

<template>
  <div class="">
    <BgGradient />
    <div
      class="z-[100] h-screen w-screen overflow-hidden px-10 opacity-95 xl:px-32"
    >
      <NuxtPage />
    </div>
    <Analytics />
  </div>
</template>

<style></style>
