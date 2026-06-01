import tailwindcss from "@tailwindcss/vite";
import { STORAGE_KEYS, FAMILY_DEFAULTS } from "./theme-registry";

// Render-blocking script applied before first paint: reads the saved theme from
// localStorage (falling back to OS prefers-color-scheme, then the family
// default) and writes data-family / data-variant / .dark onto <html>, so a
// stored non-default theme never flashes the default. The storage keys and the
// per-family default map are injected from ~/theme-registry, so this can't drift
// from useTheme(). Only the OS-preference logic is restated here (it must be an
// inline string and can't import the composable).
const themeInitScript = `(function(){try{var f=localStorage.getItem(${JSON.stringify(STORAGE_KEYS.family)})||'aurora';var V=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEYS.variants)})||'{}');var M=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEYS.modes)})||'{}');var D=${JSON.stringify(FAMILY_DEFAULTS)};var d=D[f]||D.aurora;var v=V[f]||d[0];var mm=window.matchMedia;var sm=mm?(mm('(prefers-color-scheme: dark)').matches?'dark':(mm('(prefers-color-scheme: light)').matches?'light':null)):null;var m=M[f]||sm||d[1];var e=document.documentElement;e.setAttribute('data-family',f);e.setAttribute('data-variant',v);e.classList.toggle('dark',m==='dark');e.style.colorScheme=m;}catch(_){}})();`;

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
