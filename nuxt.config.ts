import Tailwind from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,
  },

  compatibilityDate: "2025-07-15",

  modules: [
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/fonts",
    "nuxt-security",
    "@vueuse/nuxt",
    "@nuxtjs/supabase",
    "@nuxtjs/color-mode",
    "motion-v/nuxt",
    "@vee-validate/nuxt",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "vue-sonner/nuxt",
    "nuxt-lucide-icons",
  ],

  css: ["~/assets/css/main.css"],

  vite: {
    plugins: [Tailwind()],
  },

  fonts: {
    experimental: {
      processCSSVariables: true,
    },
  },

  postcss: {
    plugins: {
      cssnano: {
        preset: "default",
      },
    },
  },

  image: {
    quality: 80,
    format: ["webp"],
  },

  app: {
    head: {
      title: "Welcome",
      titleTemplate: "%s - Nuxt 4 Starter Template",
      link: [{ rel: "icon", type: "image/png", href: "/favicon.png" }],
    },
    rootAttrs: {
      "data-vaul-drawer-wrapper": "",
    },
  },

  runtimeConfig: {
    supabase: {
      url: process.env.SUPABASE_URL,
      key: process.env.SUPABASE_KEY,
      serviceKey: process.env.SUPABASE_SERVICE_KEY,
    },
    public: {
      buildAt: new Date().toLocaleString("nb-US", {
        timeZone: "Europe/Helsinki",
      }),
      environment: "production",
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    },
  },

  security: {
    headers: {
      contentSecurityPolicy: {
        "img-src": [
          "'self'",
          "data:",
          "https://res.cloudinary.com",
          "https://misyrpoxvyxwrnhnmeww.supabase.co",
        ],
      },
    },
  },

  typescript: {
    strict: true,
  },

  telemetry: false,

  imports: {
    imports: [
      {
        from: "tailwind-variants",
        name: "tv",
      },
      {
        from: "tailwind-variants",
        name: "VariantProps",
        type: true,
      },
      {
        from: "vue-sonner",
        name: "toast",
        as: "useSonner",
      },
    ],
  },

  colorMode: {
    storageKey: "dtjj-v2-color-mode",
    classSuffix: "",
  },

  icon: {
    clientBundle: {
      scan: true,
      sizeLimitKb: 0,
    },

    mode: "svg",
    class: "shrink-0",
    fetchTimeout: 2000,
    serverBundle: "local",
  },
});
