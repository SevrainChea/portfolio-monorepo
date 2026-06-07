// Picks a random family + variant on every full page load. The choice is made
// on the SERVER (per request) and travels in the Nuxt payload via useState, so
// SSR renders the matching layout and the client hydrates to the identical
// value — no hydration mismatch and no post-mount layout swap. Light/dark is
// resolved client-side from prefers-color-scheme (see the FOUC script in
// nuxt.config and systemMode in useTheme), since the server can't know it.

import { THEME_REGISTRY, pickRandomTheme, type FamilyId } from "~/theme-registry";

export default defineNuxtPlugin(() => {
  const family = useState<FamilyId>("pf-family", () => "aurora");
  const variants = useState<Record<string, string>>("pf-variants", () => ({}));

  if (import.meta.server) {
    const { family: f, variant: v } = pickRandomTheme();
    family.value = f;
    variants.value = { [f]: v };
  }

  // Single writer for data-family/data-variant: renders into the SSR <html> tag
  // AND stays reactive for live switcher changes (replaces the equivalent
  // setAttribute lines that used to live in app.vue's watcher).
  useHead({
    htmlAttrs: {
      "data-family": () => family.value,
      "data-variant": () =>
        variants.value[family.value] ??
        THEME_REGISTRY[family.value].defaultVariant,
    },
  });
});
