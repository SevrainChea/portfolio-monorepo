import tailwindcss from "@tailwindcss/vite";

// Runs before first paint to apply the saved theme to <html>, preventing a
// flash of the default (Aurora / Cobalt / dark) when a visitor has a different
// theme stored. When no mode is stored it honors the OS prefers-color-scheme,
// falling back to the family default. Keep this in sync with useTheme() — same
// localStorage keys, per-family defaults, and OS-preference logic.
const themeInitScript = `(function(){try{var f=localStorage.getItem('pf-family')||'aurora';var V=JSON.parse(localStorage.getItem('pf-variants')||'{}');var M=JSON.parse(localStorage.getItem('pf-modes')||'{}');var D={aurora:['cobalt','dark']};var d=D[f]||D.aurora;var v=V[f]||d[0];var mm=window.matchMedia;var sm=mm?(mm('(prefers-color-scheme: dark)').matches?'dark':(mm('(prefers-color-scheme: light)').matches?'light':null)):null;var m=M[f]||sm||d[1];var e=document.documentElement;e.setAttribute('data-family',f);e.setAttribute('data-variant',v);e.classList.toggle('dark',m==='dark');e.style.colorScheme=m;}catch(_){}})();`;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css", "~/assets/css/tailwind.css"],

  app: {
    head: {
      script: [{ innerHTML: themeInitScript, tagPosition: "head" }],
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
  modules: ["@nuxt/image", "@nuxt/icon"],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:8000",
    },
  },
});
