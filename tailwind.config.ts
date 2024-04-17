import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

import plugin from 'tailwindcss/plugin';
import scrollbar from 'tailwind-scrollbar';
import forms from '@tailwindcss/forms';
import containerqueries from '@tailwindcss/container-queries';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	variants: {
		extend: {
			'background-image': ['autofill'],
		},
	},
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			fontFamily: {
				sans: ['Geist sans', ...fontFamily.sans],
				mono: ['Geist mono', ...fontFamily.mono],
			},
			backgroundImage: {
				none: 'none !important',
			},
			container: {
				center: true,
				padding: '2rem',
				screens: {
					'2xl': '1400px',
				},
			},
			colors: {
				border: 'hsl(var(--border) / <alpha-value>)',
				input: 'hsl(var(--input) / <alpha-value>)',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background) / <alpha-value>)',
				foreground: 'hsl(var(--foreground) / <alpha-value>)',
				accent: {
					100: '#ffd8cc',
					200: '#ffb299',
					300: '#ff8b66',
					400: '#ff6533',
					500: '#ff3e00',
					600: '#cc3200',
					700: '#992500',
					800: '#661900',
					900: '#330c00',
				},
				neutral: {
					808: '#2e2e2e',
					309: '#cccccc',
				},
				primary: {
					DEFAULT: "hsl(var(--primary) / <alpha-value>)",
					foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
					foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
					foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
					foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
				},
				// accent: {
				// 	DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
				// 	foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
				// },
				popover: {
					DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
					foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
				},
				card: {
					DEFAULT: 'hsl(var(--card) / <alpha-value>)',
					foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
				},
			},
			animation: {
				pulse: 'pulse 1.3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'gradient-x': 'gradient-x 1.3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			},
			keyframes: {
				pulse: {
					'0%, 100%': {
						opacity: '0',
					},
					'50%': {
						opacity: '1',
					},
				},
				'gradient-x': {
					'100%': {
						'background-size': '200% 200%',
						'background-position': 'left center',
					},
					'0%': {
						'background-size': '200% 200%',
						'background-position': 'right center',
					},
				},
			},
			containers: {
				'2xs': '15rem',
			},
		},
	},

	plugins: [
		plugin(({ matchUtilities, theme }) => {
			matchUtilities(
				{
					'animation-delay': (value) => ({
							'animation-delay': value,
						}),
				},
				{
					values: theme('transitionDelay'),
				}
			);
		}),
		scrollbar,
		forms,
		containerqueries
	],
} satisfies Config
