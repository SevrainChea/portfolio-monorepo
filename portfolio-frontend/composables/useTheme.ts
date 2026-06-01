// Reactive, persisted theme state for the multi-theme portfolio.
//
// Axes: family → variant → mode. The registry, storage keys, and per-family
// defaults live in the dependency-free `~/theme-registry` module so they are
// shared with nuxt.config's pre-paint FOUC script and can't drift.
//
// The active family/variant/mode are written onto <html> as
// `data-family` / `data-variant` / `.dark` (by the inline script before paint
// and by app.vue's watcher thereafter). Components read CSS `var(--th-*)`
// tokens, which resolve to whichever selector block matches those attributes.

import { computed, onMounted } from "vue";
import {
  THEME_REGISTRY,
  STORAGE_KEYS,
  type FamilyId,
  type Mode,
} from "~/theme-registry";

// Re-export so components can import everything theme-related from one place.
export {
  THEME_REGISTRY,
  UPCOMING_FAMILIES,
  ALL_VARIANT_IDS,
  STORAGE_KEYS,
} from "~/theme-registry";
export type { FamilyId, Mode, VariantDef, FamilyDef } from "~/theme-registry";

function loadString(key: string, fallback: string): string {
  if (!import.meta.client) return fallback;
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function loadJSON<T>(key: string, fallback: T): T {
  if (!import.meta.client) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useTheme() {
  const family = useState<FamilyId>("pf-family", () => "aurora");
  const variants = useState<Record<string, string>>("pf-variants", () => ({}));
  const modes = useState<Record<string, Mode>>("pf-modes", () => ({}));
  const hydrated = useState<boolean>("pf-hydrated", () => false);
  // OS preference, detected on the client; used as the mode fallback before any
  // explicit choice is stored. null = no OS preference → use the family default.
  const systemMode = useState<Mode | null>("pf-system-mode", () => null);

  // Hydrate from localStorage AFTER mount, not during setup: this keeps the
  // first client render identical to the SSR default render, avoiding a Vue
  // hydration mismatch that otherwise left a stale `active` class on the
  // switcher. The post-mount state update flushes before paint, so there is no
  // visible flash.
  if (import.meta.client) {
    onMounted(() => {
      if (hydrated.value) return;
      hydrated.value = true;
      const storedFamily = loadString(STORAGE_KEYS.family, "aurora");
      if (storedFamily in THEME_REGISTRY)
        family.value = storedFamily as FamilyId;
      variants.value = loadJSON<Record<string, string>>(STORAGE_KEYS.variants, {});
      modes.value = loadJSON<Record<string, Mode>>(STORAGE_KEYS.modes, {});
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

  function persist() {
    if (!import.meta.client) return;
    try {
      localStorage.setItem(STORAGE_KEYS.family, family.value);
      localStorage.setItem(STORAGE_KEYS.variants, JSON.stringify(variants.value));
      localStorage.setItem(STORAGE_KEYS.modes, JSON.stringify(modes.value));
    } catch {
      /* ignore quota / disabled storage */
    }
  }

  function setFamily(id: FamilyId) {
    if (!(id in THEME_REGISTRY)) return;
    family.value = id;
    persist();
  }
  function setVariant(id: string) {
    variants.value = { ...variants.value, [family.value]: id };
    persist();
  }
  function setMode(m: Mode) {
    modes.value = { ...modes.value, [family.value]: m };
    persist();
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
