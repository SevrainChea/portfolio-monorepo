<template>
  <a
    :href="href"
    :class="[
      'hover:text-fg-highlight after:bg-fg-highlight relative inline-block font-bold text-white transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:transition-all after:duration-300 hover:after:w-full',
      sizeClass,
    ]"
    @click="onNavigate"
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    href: string;
    size?: 'sm' | 'base';
  }>(),
  {
    size: 'base',
  },
);

const emit = defineEmits<{
  navigate: [];
}>();

const sizeClass = {
  sm: 'text-sm',
  base: 'text-base',
}[props.size];

const onNavigate = () => {
  emit('navigate');
};
</script>
