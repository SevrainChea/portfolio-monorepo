// Single source of truth for the theme system — plain data + types, with NO
// Vue/Nuxt runtime imports so it can be imported by BOTH the runtime composable
// (useTheme) AND nuxt.config (to generate the pre-paint inline FOUC script).
// Keys and per-family defaults therefore can never drift between the two.
//
// Adding a family later is: (1) a token block in tailwind.css, (2) a
// <XLayout>.vue, (3) an entry in THEME_REGISTRY here (and remove it from
// UPCOMING_FAMILIES). Everything else (switcher swatches, the FOUC script's
// default map, the active-ring CSS) derives from this registry.

export type FamilyId = "aurora" | "neon" | "editorial" | "blueprint";
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

/** localStorage keys (shared by useTheme persistence and the FOUC script). */
export const STORAGE_KEYS = {
  family: "pf-family",
  variants: "pf-variants",
  modes: "pf-modes",
} as const;

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
  neon: {
    id: "neon",
    name: "Neon",
    sub: "Neon sign",
    defaultVariant: "hotline",
    defaultMode: "dark",
    breakpoint: 760,
    variants: [
      {
        id: "hotline",
        name: "Hotline",
        swatch: { dark: ["#ff2e88", "#2de2e6"], light: ["#e0247a", "#0aa1a6"] },
      },
      {
        id: "acid",
        name: "Acid",
        swatch: { dark: ["#b6ff3c", "#2f9bff"], light: ["#4fa514", "#1f78d6"] },
      },
      {
        id: "electric",
        name: "Electric",
        swatch: { dark: ["#2e9bff", "#b14bff"], light: ["#1f5fe0", "#8b2fdc"] },
      },
    ],
  },
  editorial: {
    id: "editorial",
    name: "Editorial",
    sub: "The issue",
    defaultVariant: "issue",
    defaultMode: "light",
    breakpoint: 760,
    variants: [
      {
        id: "issue",
        name: "The Issue",
        swatch: { light: ["#f4efe4", "#b8472b"], dark: ["#191510", "#e07a4a"] },
      },
      {
        id: "noir",
        name: "Broadsheet",
        swatch: { light: ["#faf8f1", "#14110c"], dark: ["#141413", "#f5f3ec"] },
      },
      {
        id: "forest",
        name: "Quarterly",
        swatch: { light: ["#eef0e9", "#2f6d52"], dark: ["#121712", "#6fbb8c"] },
      },
    ],
  },
  blueprint: {
    id: "blueprint",
    name: "Blueprint",
    sub: "Spec sheet",
    defaultVariant: "azure",
    defaultMode: "dark",
    breakpoint: 760,
    variants: [
      {
        id: "azure",
        name: "Azure",
        swatch: { dark: ["#5bb4e8", "#f0a652"], light: ["#2b78b4", "#bf6f1f"] },
      },
      {
        id: "crimson",
        name: "Crimson",
        swatch: { dark: ["#e2796c", "#54c2b2"], light: ["#c0524a", "#2f8f7e"] },
      },
      {
        id: "verdant",
        name: "Verdant",
        swatch: { dark: ["#5fc090", "#ec9a5e"], light: ["#2f9266", "#c0682a"] },
      },
    ],
  },
};

/** Families not yet implemented — shown disabled in the switcher dropdown. */
export const UPCOMING_FAMILIES = [] as const;

/** `{ [familyId]: [defaultVariant, defaultMode] }` — derived for the FOUC script. */
export const FAMILY_DEFAULTS: Record<string, [string, Mode]> =
  Object.fromEntries(
    Object.values(THEME_REGISTRY).map((f) => [
      f.id,
      [f.defaultVariant, f.defaultMode],
    ]),
  );

/** All variant ids across every registered family (for the active-ring CSS). */
export const ALL_VARIANT_IDS: string[] = Object.values(THEME_REGISTRY).flatMap(
  (f) => f.variants.map((v) => v.id),
);

/** Pick a random family + one of its variants (chosen fresh per page load). */
export function pickRandomTheme(): { family: FamilyId; variant: string } {
  const ids = Object.keys(THEME_REGISTRY) as FamilyId[];
  const family = ids[Math.floor(Math.random() * ids.length)];
  const variants = THEME_REGISTRY[family].variants;
  const variant = variants[Math.floor(Math.random() * variants.length)].id;
  return { family, variant };
}
