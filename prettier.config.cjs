/** @type {import('prettier').Config} */
const config = {
	useTabs: true,
	singleQuote: true,
	semi: true,
	trailingComma: 'es5',
	tabWidth: 2,
	printWidth: 120,
	plugins: [
		require('prettier-plugin-svelte'),
		require('prettier-plugin-tailwindcss'),
		require('prettier-plugin-prisma'),
	],
	tailwindConfig: './tailwind.config.cjs',
	pluginSearchDirs: ['.'],
	overrides: [
		{
			files: '*.svelte',
			options: {
				parser: 'svelte',
				svelteSortOrder: 'options-scripts-markup-styles',
				bracketSameLine: true,
				bracketSpacing: true,
			},
		},
		{
			files: '*.prisma',
			options: {
				parser: 'prisma-parse',
			},
		},
	],
};

module.exports = config;
