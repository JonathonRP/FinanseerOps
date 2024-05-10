<script lang="ts">
	import { Button as ButtonPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';
	import type { Events, Props } from './index.js';
	import { buttonVariants } from './variants.js';

	type $$Props = Props;
	type $$Events = Events;

	let className: $$Props['class'];
	export let variant: $$Props['variant'] = 'default';
	export let size: $$Props['size'] = 'default';
	export let builders: $$Props['builders'] = [];
	export { className as class };
</script>

<ButtonPrimitive.Root
	{builders}
	class={cn(buttonVariants({ variant, size, className }))}
	type="button"
	{...$$restProps}
	on:click
	on:keydown>
	<slot></slot>
</ButtonPrimitive.Root>
