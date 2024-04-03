<svelte:options runes={true} />

<script lang="ts">
	import { cn } from '$/lib/utils';
	import type { DefaultPropsType } from '.';

	const { children, ...restProps }: DefaultPropsType = $props();
</script>

<dt class={cn(restProps.class)}>
	{@render children()}
</dt>
