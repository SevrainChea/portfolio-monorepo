// The theme family/variant is randomized per request (plugins/random-theme), so
// the page HTML must never be cached. nuxt.config routeRules only set the header
// at Vercel's CDN-egress layer — the Nitro function still emits Nuxt's default
// `max-age=0, must-revalidate`, which Vercel's edge happily caches (serving one
// frozen random pick for everyone: x-vercel-cache: HIT). Overriding the header
// here, inside the function's response, makes it emit `no-store` so Vercel skips
// the cache and re-renders (a fresh random theme) on every request.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:response", (response, { event }) => {
    const path = (event.path || "").split("?")[0];
    if (path === "/" || path === "/chat") {
      response.headers = { ...response.headers, "cache-control": "no-store" };
    }
  });
});
