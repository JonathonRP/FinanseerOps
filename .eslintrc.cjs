const config = {
  root: true,
  parser: "@typescript-eslint/parser",
  rules: {
    semi: ["error", "always"],
    "arrow-body-style": ["error", "as-needed"],
    "prefer-arrow-callback": ["error", { allowNamedFunctions: false, allowUnboundThis: true }],
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    "import/no-mutable-exports": 0,
    "no-restricted-syntax": 0,
    "import/prefer-default-export": 0,
		"no-param-reassign": 0,
		"import/extensions": 0,
		"import/no-duplicates": 0,
		"import-no-duplicates-prefix-resolved-path/no-duplicates": [
			"error",
			{
				prefixResolvedPathWithImportName: true,
			},
		],
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:svelte/recommended",
    "airbnb-base",
    "airbnb-typescript/base",
    "plugin:import/recommended",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: "./tsconfig.json",
    extraFileExtensions: [".svelte"],
  },
  env: {
    es6: true,
    node: true,
    browser: true,
  },
  overrides: [
    {
      files: ["**/*.svelte"],
      parser: "svelte-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
      rules: {
				'import/no-named-as-default': 0,
				'import/no-named-as-default-member': 0,
			},
    },
  ],
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".cjs", "js", ".ts", ".svelte"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  plugins: ["@typescript-eslint","import-no-duplicates-prefix-resolved-path"],
  ignorePatterns: [
    "node_modules",
    "dist",
    "build",
    ".{svelte,svelte-kit,pnpm-store,vercel_build_output}",
    "*.cjs",
    "svelte.config.js",
    "static/*.{js,ts,css}",
  ],
};

module.exports = config;
