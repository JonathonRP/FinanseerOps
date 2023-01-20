import { sveltekit } from "@sveltejs/kit/vite";

// TODO: should use env variables for buxfer account login and create/seed user in a database

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],

  server: {
    port: "5000",
    // proxy: {
    //   "/api": "https://www.buxfer.com",
    // },
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "src/variables.scss" as *;',
      },
    },
  },
};

export default config;
