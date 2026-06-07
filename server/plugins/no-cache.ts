// The theme family/variant is randomized per request (plugins/random-theme), so
// the page HTML must never be cached — otherwise Vercel's edge serves one frozen
// random pick to everyone (x-vercel-cache: HIT, age growing across requests).
//
// A plain `Cache-Control: no-store` is NOT enough: Vercel's CDN obeys its own
// header hierarchy, where `Vercel-CDN-Cache-Control` (and then
// `CDN-Cache-Control`) override the browser-facing `Cache-Control` for the edge
// cache decision. So we set all three here, inside the function response, to
// force a fresh SSR render on every request.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:response", (response, { event }) => {
    const path = (event.path || "").split("?")[0];
    if (path === "/" || path === "/chat") {
      response.headers = {
        ...response.headers,
        "cache-control": "no-store",
        "cdn-cache-control": "no-store",
        "vercel-cdn-cache-control": "no-store",
      };
    }
  });
});
