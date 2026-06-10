// Seeds the reactive theme state with the random family + variant picked (before
// paint) by the inline FOUC script in nuxt.config (stashed on window.__pfTheme).
// Runs as a client plugin BEFORE the app renders, so the very first render uses
// the random family — no layout swap. Pages are client-rendered (routeRules
// ssr:false), so there is no SSR markup to mismatch.
import {
  THEME_REGISTRY,
  pickRandomTheme,
  type FamilyId,
} from "~/theme-registry";

export default defineNuxtPlugin(() => {
  const family = useState<FamilyId>("pf-family", () => "aurora");
  const variants = useState<Record<string, string>>("pf-variants", () => ({}));

  const picked = (window as { __pfTheme?: { family: string; variant: string } })
    .__pfTheme;
  const { family: f, variant: v } =
    picked && picked.family in THEME_REGISTRY
      ? { family: picked.family as FamilyId, variant: picked.variant }
      : pickRandomTheme();

  family.value = f;
  variants.value = { [f]: v };
});
