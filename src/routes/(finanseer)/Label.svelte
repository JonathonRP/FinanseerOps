<script lang="ts">
	import { cn } from '$lib/utils';
</script>

<p class={cn('text-gray-401 text-base dark:text-gray-300', $$restProps.class)}>
	<slot />
</p>
