<script lang="ts">
	export let hasAdditional = false;
</script>

<div
	class="relative overflow-hidden rounded bg-white p-5 shadow-sm dark:bg-gray-800 dark:shadow-neutral-309/20 {hasAdditional &&
		'px-5 pb-12 pt-6'}">
	<slot />
</div>
