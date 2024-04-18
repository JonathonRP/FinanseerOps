/** @type {import('prettier').Config} */
const config = {
	useTabs: true,
	singleQuote: true,
	semi: true,
	trailingComma: 'es5',
	tabWidth: 2,
	printWidth: 120,
	plugins: ['prettier-plugin-svelte', 'prettier-plugin-tailwindcss'],
	pluginSearchDirs: false,
	tailwindConfig: './tailwind.config.ts',
	overrides: [
		{
			files: '*.svelte',
			options: {
				parser: 'svelte',
				bracketSameLine: true,
				bracketSpacing: true,
			},
		},
	],
};

export default config;
