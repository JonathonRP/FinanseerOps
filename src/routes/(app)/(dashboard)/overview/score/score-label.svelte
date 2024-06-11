<svelte:options runes={true} />

<script lang="ts">
	import { cn } from '$/lib/utils';
	import type { DefaultPropsType } from '.';

	const { children, ...restProps }: DefaultPropsType = $props();
</script>

<p class={cn('text-base line-clamp-1', restProps.class)}>
	{@render children()}
</p>
