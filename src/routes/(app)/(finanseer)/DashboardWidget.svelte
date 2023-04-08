<script lang="ts">
	// import classes from 'svelte-transition-classes';
	import { Motion } from 'svelte-motion';

	// TODO - figure out pop-in animation, delay is needed but where!?
	// in:classes={{
	// 	duration: 300,
	// 	base: 'transform transition-transform duration-300',
	// 	from: 'scale-0',
	// 	to: 'scale-100',
	// }}
	// out:classes={{
	// 	duration: 300,
	// 	base: 'transform transition-transform duration-300',
	// 	from: 'scale-100',
	// 	to: 'scale-0',
	// }}
</script>

<Motion {...$$restProps} let:motion let:props>
	<div {...props} use:motion class="rounded bg-white p-5 shadow-sm dark:bg-gray-800 dark:shadow-neutral-309/20">
		<slot />
	</div>
</Motion>
