// Inject a dark default class onto the SSR <html> so the no-JS / pre-script
// state is internally consistent (dark switcher chrome over the dark :root
// fallback tokens). When JS runs, the render-blocking inline script
// (nuxt.config app.head) overrides this per the visitor's stored choice or OS
// preference before first paint. Done as a server-only HTML injection (not via
// useHead) so unhead never manages the class and can't re-assert it on the
// client and re-introduce a flash for light-mode visitors.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:html", (html) => {
    html.htmlAttrs.push('class="dark"');
  });
});
