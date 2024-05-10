<script lang="ts">
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';
	import { cn } from '$lib/utils';

	type $$Props = DrawerPrimitive.DescriptionProps;

	export let el: $$Props['el'];
	let className: $$Props['class'];
	export { className as class };
</script>

<DrawerPrimitive.Description bind:el class={cn('text-sm text-muted-foreground', className)} {...$$restProps}>
	<slot></slot>
</DrawerPrimitive.Description>
