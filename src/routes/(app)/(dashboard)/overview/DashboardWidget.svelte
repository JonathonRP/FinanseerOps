<svelte:options runes={true} />

<script lang="ts">
	import type { Snippet } from 'svelte';

	import { cn } from '$lib/utils/cn';
	import { tv, type VariantProps } from 'tailwind-variants';

	const dashboardWidgetVariants = tv({
		base: 'bg-white dark:bg-gray-800 dark:shadow-neutral-309/20 overflow-hidden rounded-xl p-5 shadow-lg h-full',
		variants: {
			variant: {
				default: '',
				danger:
					'fill-rose-500 dark:fill-rose-400 bg-red-100 text-red-600 shadow-red-50/20 dark:bg-red-900 dark:text-red-300 dark:shadow-red-300/40',
				warning:
					'fill-yellow-500 dark:fill-yellow-400 bg-yellow-100 text-yellow-400 shadow-yellow-50/20 dark:bg-yellow-900 dark:text-amber-400 dark:shadow-yellow-300/40',
				success:
					'fill-emerald-500 dark:fill-emerald-400 bg-green-100 text-green-600 shadow-green-50/20 dark:bg-green-900 dark:text-emerald-400 dark:shadow-green-300/40',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	});

	type Variant = VariantProps<typeof dashboardWidgetVariants>['variant'];

	const {
		variant = 'default',
		children,
		class: className,
	}: { variant?: Variant; children: Snippet; class?: string } = $props();

	// let loading = $state(true);
	// let mounting = $state(true);

	// $effect(() => {
	// 	loading = false;
	// 	mounting = false;
	// });
</script>

<dl class={cn(dashboardWidgetVariants({ variant, className }))}>
	{@render children()}
</dl>
