// Reactive (session-only) theme state for the multi-theme portfolio.
//
// Axes: family → variant → mode. The registry and per-family defaults live in
// the dependency-free `~/theme-registry` module so they are shared with
// nuxt.config's pre-paint FOUC script and can't drift.
//
// Family/variant are randomized per request on the server (plugins/random-theme)
// and ship in the payload; mode follows the OS prefers-color-scheme. Nothing is
// persisted — every full page load picks a fresh theme. The active values are
// written onto <html> as `data-family` / `data-variant` (by the plugin's
// useHead) and `.dark` (by the inline script before paint, then app.vue's
// watcher). Components read CSS `var(--th-*)` tokens, which resolve to whichever
// selector block matches those attributes.

import { computed, onMounted } from "vue";
import { THEME_REGISTRY, type FamilyId, type Mode } from "~/theme-registry";

// Re-export so components can import everything theme-related from one place.
export {
  THEME_REGISTRY,
  UPCOMING_FAMILIES,
  ALL_VARIANT_IDS,
  STORAGE_KEYS,
} from "~/theme-registry";
export type { FamilyId, Mode, VariantDef, FamilyDef } from "~/theme-registry";

export function useTheme() {
  const family = useState<FamilyId>("pf-family", () => "aurora");
  const variants = useState<Record<string, string>>("pf-variants", () => ({}));
  const modes = useState<Record<string, Mode>>("pf-modes", () => ({}));
  const hydrated = useState<boolean>("pf-hydrated", () => false);
  // OS preference, detected on the client; used as the mode fallback before any
  // explicit choice is stored. null = no OS preference → use the family default.
  const systemMode = useState<Mode | null>("pf-system-mode", () => null);

  // Family/variant are seeded per request on the server (plugins/random-theme)
  // and travel in the payload, so there is nothing to restore here. We only
  // detect the OS light/dark preference AFTER mount (it can't be known during
  // SSR); that update flushes before paint so there is no flash.
  if (import.meta.client) {
    onMounted(() => {
      if (hydrated.value) return;
      hydrated.value = true;
      const mm = window.matchMedia;
      systemMode.value = mm("(prefers-color-scheme: dark)").matches
        ? "dark"
        : mm("(prefers-color-scheme: light)").matches
          ? "light"
          : null;
    });
  }

  const families = Object.values(THEME_REGISTRY);
  const currentFamily = computed(() => THEME_REGISTRY[family.value]);
  const currentVariant = computed(
    () => variants.value[family.value] ?? currentFamily.value.defaultVariant,
  );
  const currentMode = computed<Mode>(
    () =>
      modes.value[family.value] ??
      systemMode.value ??
      currentFamily.value.defaultMode,
  );
  const currentVariantDef = computed(
    () =>
      currentFamily.value.variants.find((v) => v.id === currentVariant.value) ??
      currentFamily.value.variants[0],
  );
  const isDark = computed(() => currentMode.value === "dark");
  /** Accent color of the active variant/mode (switcher chrome `--acc`). */
  const accent = computed(
    () => currentVariantDef.value.swatch[currentMode.value][1],
  );

  // Live, session-only overrides — the theme re-randomizes on the next full
  // page load, so nothing is persisted to storage.
  function setFamily(id: FamilyId) {
    if (!(id in THEME_REGISTRY)) return;
    family.value = id;
  }
  function setVariant(id: string) {
    variants.value = { ...variants.value, [family.value]: id };
  }
  function setMode(m: Mode) {
    modes.value = { ...modes.value, [family.value]: m };
  }
  function toggleMode() {
    setMode(currentMode.value === "dark" ? "light" : "dark");
  }

  return {
    families,
    family,
    currentFamily,
    currentVariant,
    currentVariantDef,
    currentMode,
    isDark,
    accent,
    setFamily,
    setVariant,
    setMode,
    toggleMode,
  };
}
