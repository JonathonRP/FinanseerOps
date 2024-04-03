<svelte:options runes={true} />

<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements';
	import type { MotionProps } from 'svelte-motion';
	// import { default as Motion } from 'svelte-motion/src/motion/MotionSSR.svelte';
	import { Motion } from 'svelte-motion';
	import type { DefaultPropsType } from './types';

	const {
		as,
		isSVG,
		children,
		style,
		class: className,
		...restProps
	}: { as: keyof SvelteHTMLElements } & DefaultPropsType<keyof SvelteHTMLElements> = $props();
</script>

<Motion {isSVG} {style} {...((props: MotionProps) => (props))(restProps)} let:motion>
	<svelte:element
		this={as}
		class={className}
		{...((props: SvelteHTMLElements[typeof as]) => (props))(restProps)}
		use:motion>
		{#if children}
			{@render children()}
		{/if}
	</svelte:element>
</Motion>
