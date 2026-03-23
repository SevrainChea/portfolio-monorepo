import { GlacePlugin } from "@glace-ui/vue";
import "@glace-ui/vue/css";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(GlacePlugin);
});
