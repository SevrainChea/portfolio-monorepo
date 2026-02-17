<template>
  <header
    class="lg:flex-shrink-0 lg:h-full lg:min-w-[40%] lg:overflow-hidden lg:py-12"
  >
    <!-- Mobile Sticky Header -->
    <div
      class="bg-primary-bg1/80 fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between gap-4 border-b border-white/20 px-6 backdrop-blur-lg lg:hidden"
    >
      <Transition
        enter-active-class="transition-all duration-300"
        enter-from-class="opacity-0 -translate-x-4"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-300"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 -translate-x-4"
      >
        <div
          v-if="!mobileMenuOpen"
          class="flex min-w-0 items-center gap-3"
        >
          <img
            src="/public/images/profile_home.jpeg"
            alt="Sevrain Chea"
            class="h-10 w-10 flex-shrink-0 rounded-full object-cover"
          />
          <h1 class="truncate text-base font-bold text-white">Sévrain CHEA</h1>
        </div>
      </Transition>
      <button
        @click="mobileMenuOpen = !mobileMenuOpen"
        class="hover:text-fg-highlight ml-auto flex flex-shrink-0 items-center font-bold text-white transition-colors duration-300"
        :aria-expanded="mobileMenuOpen"
        aria-label="Toggle navigation menu"
      >
        <Icon :name="mobileMenuOpen ? 'mdi:close' : 'mdi:menu'" size="24" />
      </button>
    </div>

    <!-- Mobile Content Padding for Fixed Header -->

    <!-- Mobile Menu Overlay -->
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-300"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div
        v-show="mobileMenuOpen"
        class="bg-primary-bg1/95 fixed top-16 left-0 right-0 z-40 max-h-[33vh] overflow-y-auto backdrop-blur-lg lg:hidden"
      >
      <div class="flex gap-6 px-6 py-4">
        <!-- Profile Section in Menu -->
        <div class="flex flex-1 flex-col items-center">
          <img
            src="/public/images/profile_home.jpeg"
            alt="Sevrain Chea"
            class="mb-2 h-16 w-16 rounded-full object-cover shadow-lg"
          />
          <h2 class="mb-0.5 text-center text-sm font-bold text-white">
            Sévrain CHEA
          </h2>
          <p class="mb-2 text-center text-xs text-white italic">
            Tech Lead - Full-Stack Engineer
          </p>
          <p class="text-center text-xs leading-relaxed text-fg-muted">
            Start-up mindset — shipping fast, iterating on product, and building
            scalable processes for high-performing engineering teams.
          </p>
        </div>

        <!-- Navigation Links in Menu -->
        <nav class="flex flex-shrink-0 flex-col justify-center">
          <ul class="flex flex-col gap-3">
            <li>
              <NavLink href="#about" @navigate="mobileMenuOpen = false"
                >About</NavLink
              >
            </li>
            <li>
              <NavLink href="#experiences" @navigate="mobileMenuOpen = false"
                >Experiences</NavLink
              >
            </li>
            <li>
              <NavLink href="#projects" @navigate="mobileMenuOpen = false"
                >Projects</NavLink
              >
            </li>
          </ul>
        </nav>
      </div>
      </div>
    </Transition>

    <!-- Desktop Layout - Hidden on Mobile -->
    <div class="hidden h-full flex-col lg:flex">
      <GlassCard class="flex h-fit flex-col justify-between">
        <img
          src="/public/images/profile_home.jpeg"
          alt="Sevrain Chea"
          class="h-40 w-40 rounded-full !bg-white/10 object-cover shadow-lg"
        />
        <h1 class="text-5xl">Sévrain CHEA</h1>
        <h2 class="text-lg italic">Tech Lead - Full-Stack Engineer</h2>
        <p class="text-fg-muted mt-4 lg:max-w-lg">
          Start-up mindset — shipping fast, iterating on product, and building
          scalable processes for high-performing engineering teams.
        </p>
      </GlassCard>

      <!-- Desktop Navigation -->
      <nav class="block">
        <ul class="my-8 flex flex-col gap-6">
          <li>
            <NavLink href="#about">About</NavLink>
          </li>
          <li>
            <NavLink href="#experiences">Experiences</NavLink>
          </li>
          <li>
            <NavLink href="#projects">Projects</NavLink>
          </li>
        </ul>
      </nav>

      <FooterSection class="mt-auto px-0" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const mobileMenuOpen = ref(false);

// Close menu on ESC key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && mobileMenuOpen.value) {
    mobileMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped></style>
