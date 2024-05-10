<script lang="ts">
	import * as Button from '$lib/components/ui/button/index.js';

	type $$Props = Button.Props;
	type $$Events = Button.Events;
</script>

<Button.Root
	type="submit"
	class="item-center flex w-full justify-center rounded-full bg-primary px-4 py-2 font-medium text-accent-400 transition-colors hover:bg-accent-500/90 hover:text-white focus:ring-accent-500 focus:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 dark:focus:ring-offset-neutral-808"
	on:click
	on:keydown
	{...$$restProps}>
	<slot></slot>
</Button.Root>
