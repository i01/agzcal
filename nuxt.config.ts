// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ["~/assets/css/main.css"],
  ui: {
    fonts: false
  },
  compatibilityDate: '2024-04-03',
  vite: {
    optimizeDeps: {
      include: [
        '@fullcalendar/vue3',
        '@fullcalendar/vue3/interaction',
        '@fullcalendar/vue3/list',
        '@fullcalendar/vue3/themes/classic',
        '@fullcalendar/vue3/timegrid',
        '@paralleldrive/cuid2',
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ]
    }
  }
  /*
  nitro: {
    experimental: {
      tasks: true
    }
  }
  */
})
