<svelte:options runes={true} />

<script lang="ts">
	import { cn } from '$/lib/utils';
	import type { DefaultPropsType } from '.';

	const { children, ...restProps }: DefaultPropsType = $props();
</script>

<dd
	class={cn('flex w-[164.57px] items-start pt-1', restProps.class, {
		'h-[64px]': children,
	})}>
	{@render children()}
</dd>
