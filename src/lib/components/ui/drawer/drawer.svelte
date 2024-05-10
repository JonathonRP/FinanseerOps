<script lang="ts">
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';

	type $$Props = DrawerPrimitive.Props;
	export let shouldScaleBackground: $$Props['shouldScaleBackground'] = true;
	export let open: $$Props['open'] = false;
	export let activeSnapPoint: $$Props['activeSnapPoint'];
</script>

<DrawerPrimitive.Root {shouldScaleBackground} bind:open bind:activeSnapPoint {...$$restProps}>
	<slot></slot>
</DrawerPrimitive.Root>
