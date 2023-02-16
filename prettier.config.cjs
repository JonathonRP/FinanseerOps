/** @type {import('prettier').Config} */
const config = {
  plugins: [
    require("prettier-plugin-svelte"),
    require("prettier-plugin-organize-imports"),
    require("prettier-plugin-tailwindcss"),
    require("prettier-plugin-prisma"),
  ],
  tailwindConfig: "./tailwind.config.cjs",
  overrides: [
    {
      files: "*.svelte",
      options: {
        parser: "svelte",
        svelteSortOrder: "options-scripts-markup-styles",
        bracketSameLine: true,
        bracketSpacing: true,
      },
    },
    {
      files: "*.prisma",
      options: {
        parser: "prisma-parse",
      },
    },
  ],
  pluginSearchDirs: false,
  printWidth: 120,
};

module.exports = config;
