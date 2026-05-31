// Reactive, persisted theme state for the multi-theme portfolio.
//
// Axes: family → variant → mode. Today only the Aurora family is registered;
// adding a family later is: (1) a token block in tailwind.css, (2) a
// <XLayout>.vue, (3) an entry in THEME_REGISTRY below.
//
// The active family/variant/mode are written onto <html> as
// `data-family` / `data-variant` / `.dark` (via useHead, so they are present
// during SSR too). Every component keeps reading CSS `var(--th-*)` tokens,
// which resolve to whichever selector block matches those attributes.

import { computed, onMounted } from "vue";

export type FamilyId = "aurora"; // | "neon" | "editorial" | "blueprint"
export type Mode = "dark" | "light";

export interface VariantDef {
  id: string;
  name: string;
  /** [primary, accent] gradient per mode — used for the switcher swatch. */
  swatch: { dark: [string, string]; light: [string, string] };
}

export interface FamilyDef {
  id: FamilyId;
  name: string;
  sub: string;
  defaultVariant: string;
  defaultMode: Mode;
  variants: VariantDef[];
  /** Width (px) at/under which this family collapses to its mobile layout. */
  breakpoint: number;
}

export const THEME_REGISTRY: Record<FamilyId, FamilyDef> = {
  aurora: {
    id: "aurora",
    name: "Aurora",
    sub: "Frameless",
    defaultVariant: "cobalt",
    defaultMode: "dark",
    breakpoint: 880,
    variants: [
      {
        id: "cobalt",
        name: "Cobalt & Frost",
        swatch: { dark: ["#2b5bff", "#5ad1ff"], light: ["#8fb0ff", "#1f6fe0"] },
      },
      {
        id: "emerald",
        name: "Emerald & Brass",
        swatch: { dark: ["#2f8f5c", "#cea954"], light: ["#7fc99a", "#8a6a1c"] },
      },
      {
        id: "amethyst",
        name: "Amethyst & Rose",
        swatch: { dark: ["#7c3aed", "#ef8fb3"], light: ["#b98fe6", "#c43f72"] },
      },
      {
        id: "garnet",
        name: "Garnet & Ember",
        swatch: { dark: ["#d9433f", "#ef9a55"], light: ["#f0a08f", "#c2502a"] },
      },
    ],
  },
};

/** Families not yet implemented — shown disabled in the switcher dropdown. */
export const UPCOMING_FAMILIES = [
  { id: "neon", name: "Neon" },
  { id: "editorial", name: "Editorial" },
  { id: "blueprint", name: "Blueprint" },
] as const;

const FAMILY_KEY = "pf-family";
const VARIANTS_KEY = "pf-variants";
const MODES_KEY = "pf-modes";

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

  // Hydrate from localStorage AFTER mount, not during setup: this keeps the
  // first client render identical to the SSR default render, avoiding a Vue
  // hydration mismatch that otherwise left a stale `active` class on the
  // switcher. The post-mount state update flushes before paint, so there is no
  // visible flash.
  if (import.meta.client) {
    onMounted(() => {
      if (hydrated.value) return;
      hydrated.value = true;
      const storedFamily = loadString(FAMILY_KEY, "aurora");
      if (storedFamily in THEME_REGISTRY)
        family.value = storedFamily as FamilyId;
      variants.value = loadJSON<Record<string, string>>(VARIANTS_KEY, {});
      modes.value = loadJSON<Record<string, Mode>>(MODES_KEY, {});
    });
  }

  const families = Object.values(THEME_REGISTRY);
  const currentFamily = computed(() => THEME_REGISTRY[family.value]);
  const currentVariant = computed(
    () => variants.value[family.value] ?? currentFamily.value.defaultVariant,
  );
  const currentMode = computed<Mode>(
    () => modes.value[family.value] ?? currentFamily.value.defaultMode,
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
      localStorage.setItem(FAMILY_KEY, family.value);
      localStorage.setItem(VARIANTS_KEY, JSON.stringify(variants.value));
      localStorage.setItem(MODES_KEY, JSON.stringify(modes.value));
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
