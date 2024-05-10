<svelte:options runes={true} />

<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements';
	// import type { MotionProps } from 'svelte-motion';
	// import { default as Motion } from 'svelte-motion/src/motion/MotionSSR.svelte';
	import { Motion } from 'svelte-motion';
	import type { DefaultPropsType } from './types';

	const {
		as,
		isSVG,
		children,
		class: className,
		...restProps
	}: { as: keyof SvelteHTMLElements } & DefaultPropsType<keyof SvelteHTMLElements> = $props();
</script>

<Motion {isSVG} {...restProps} let:motion let:props>
	<svelte:element this={as} class={className} xmlns={isSVG ? 'http://www.w3.org/2000/svg' : null} {...props} use:motion>
		{#if children}
			{@render children()}
		{/if}
	</svelte:element>
</Motion>
