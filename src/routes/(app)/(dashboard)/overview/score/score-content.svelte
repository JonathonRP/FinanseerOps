<svelte:options runes={true} />

<script lang="ts">
	import { cn } from '$/lib/utils';
	import type { DefaultPropsType } from '.';

	const { children, ...restProps }: DefaultPropsType = $props();
</script>

<dd
	class={cn('flex min-w-[164.57px] items-start', restProps.class, {
		'h-full min-h-[64px]': children,
	})}>
	{@render children()}
</dd>
