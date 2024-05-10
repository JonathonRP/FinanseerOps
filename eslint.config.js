import unusedImports from 'eslint-plugin-unused-imports';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default ts.config(
	{
		ignores: [
			'**/.DS_Store/**',
			'**/node_modules/**',
			'**/build/**',
			'**/.svelte-kit/**',
			'**/package/**',
			'**/.env',
			'**/.env.*',
			'!.env.example',
			'!*.cjs',
			'**/*.cjs',
			'**/pnpm-lock.yaml',
			'**/package-lock.json',
			'**/yarn.lock',
		],
	},
	js.configs.recommended,
	{
		ignores: [
			'**/node_modules',
			'**/dist',
			'**/build',
			'**/*.{svelte,svelte-kit,pnpm-store,vercel_build_output}',
			'**/*.cjs',
			'**/svelte.config.js',
			'**/static/*.{js,ts,css}',
		],
		extends: [...svelte.configs['flat/prettier']],
		plugins: {
			'@typescript-eslint': ts.plugin,
			'unused-imports': unusedImports,
		},
		languageOptions: {
			sourceType: 'module',
			ecmaVersion: 2020,
			parser: ts.parser,
			parserOptions: {
				project: true,
			},
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2015,
			},
		},
		rules: {
			'arrow-body-style': ['error', 'as-needed'],
			'prefer-arrow-callback': ['error', { allowNamedFunctions: false, allowUnboundThis: true }],
			'import/prefer-default-export': 0,
			'no-param-reassign': 0,
			'import/extensions': 0,
			'import/no-extraneous-dependencies': 0,
			'import/no-mutable-exports': 0,
			'import/no-duplicates': 0,
			'unused-imports/no-unused-imports-ts': 2,
		},
	},
	{
		files: ['**/*.js'],
		extends: [ts.configs.disableTypeChecked],
		rules: {
			// turn off other type-aware rules
			'deprecation/deprecation': 'off',
			'@typescript-eslint/internal/no-poorly-typed-ts-props': 'off',

			// turn off rules that don't apply to JS code
			'@typescript-eslint/explicit-function-return-type': 'off',
		},
	},
	prettier
);
