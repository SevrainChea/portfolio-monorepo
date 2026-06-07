import tailwindcss from "@tailwindcss/vite";
import { FAMILY_DEFAULTS } from "./theme-registry";

// Render-blocking script applied before first paint. The family/variant are
// already on the SSR'd <html> (set per request by plugins/random-theme via
// useHead), so this only resolves light/dark from the OS prefers-color-scheme
// (falling back to the family's default mode) and writes .dark / colorScheme
// before paint — no flash of the wrong mode. The per-family default map is
// injected from ~/theme-registry so it can't drift from useTheme().
const themeInitScript = `(function(){try{var e=document.documentElement;var f=e.getAttribute('data-family')||'aurora';var D=${JSON.stringify(FAMILY_DEFAULTS)};var mm=window.matchMedia;var sm=mm?(mm('(prefers-color-scheme: dark)').matches?'dark':(mm('(prefers-color-scheme: light)').matches?'light':null)):null;var m=sm||(D[f]?D[f][1]:'dark');e.classList.toggle('dark',m==='dark');e.style.colorScheme=m;}catch(_){}})();`;

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

  // Ships to Vercel as Nitro functions (the chat route lives at server/api/chat).
  nitro: { preset: "vercel" },

  // Server-only chat config. Keys mirror the Python backend's env var names
  // (chatbot-backend/app/config.py) so config carries over 1:1. These are NOT
  // public — the API key never reaches the client.
  runtimeConfig: {
    llmProvider: process.env.LLM_PROVIDER || "ollama",
    groqApiKey: process.env.GROQ_API_KEY || "",
    groqModel: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
    geminiApiKey: process.env.GEMINI_API_KEY || "",
    geminiModel: process.env.GEMINI_MODEL || "gemini-2.0-flash-lite",
    ollamaModel: process.env.OLLAMA_MODEL || "llama3.2",
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  },
});
