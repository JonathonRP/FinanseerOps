/** @type {import('prettier').Config} */
const config = {
  ...require('prettier-airbnb-config'),
  plugins: [
    require('prettier-plugin-svelte'),
    require('prettier-plugin-organize-imports'),
    require('prettier-plugin-tailwindcss'),
    require('prettier-plugin-prisma'),
  ],
  overrides: [
    {
      files: '**/*.svelte',
      options: {
        parser: 'svelte',
        svelteSortOrder: 'options-scripts-markup-styles',
      },
    },
    {
      files: '**/*.prisma',
      options: {
        parser: 'prisma-parse',
      },
    },
  ],
  pluginSearchDirs: false,
  printWidth: 120,
};

module.exports = config;
