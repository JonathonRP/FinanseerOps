<script lang="ts">
	import * as Button from "$lib/components/ui/button/index.js";

	type $$Props = Button.Props;
	type $$Events = Button.Events;
</script>

<Button.Root type="submit" class="item-center flex w-full justify-center rounded-full bg-primary text-accent-400 font-medium hover:text-white px-4 py-2 transition-colors hover:bg-accent-500/90 focus-visible:outline-none focus-visible:ring-2 focus:ring-accent-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none dark:focus:ring-offset-neutral-808" on:click on:keydown {...$$restProps}>
	<slot />
</Button.Root>