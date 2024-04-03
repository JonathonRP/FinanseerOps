<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import { scale, type TransitionConfig } from 'svelte/transition';
	import { cn } from '$lib/utils';
	import { cubicOut } from 'svelte/easing';

	type $$Props = SelectPrimitive.ContentProps;
	type $$Events = SelectPrimitive.ContentEvents;

	export let sideOffset: $$Props['sideOffset'] = 4;
	export let inTransition: $$Props['inTransition'] = flyAndScale;
	export let inTransitionConfig: $$Props['inTransitionConfig'];
	export let outTransition: $$Props['outTransition'] = scale;
	export let outTransitionConfig: $$Props['outTransitionConfig'] = {
		start: 0.95,
		opacity: 0,
		duration: 50,
	};

	let className: $$Props['class'];
	export { className as class };

	type FlyAndScaleParams = {
		y?: number;
		x?: number;
		start?: number;
		duration?: number;
	};

	export function flyAndScale(
		node: Element,
		params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
	): TransitionConfig {
		const style = getComputedStyle(node);
		const transform = style.transform === 'none' ? '' : style.transform;

		const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
			const [minA, maxA] = scaleA;
			const [minB, maxB] = scaleB;

			const percentage = (valueA - minA) / (maxA - minA);
			const valueB = percentage * (maxB - minB) + minB;

			return valueB;
		};

		const styleToString = (style: Record<string, number | string | undefined>): string =>
			Object.keys(style).reduce((str, key) => {
				if (style[key] === undefined) return str;
				return `${str}${key}:${style[key]};`;
			}, '');

		return {
			duration: params.duration ?? 200,
			delay: 0,
			css: (t) => {
				const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
				const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
				const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

				return styleToString({
					transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
					opacity: t,
				});
			},
			easing: cubicOut,
		};
	}
</script>

<SelectPrimitive.Content
	{inTransition}
	{inTransitionConfig}
	{outTransition}
	{outTransitionConfig}
	{sideOffset}
	class={cn(
		'bg-popover text-popover-foreground relative z-50 min-w-[8rem] overflow-hidden rounded-md border shadow-md outline-none',
		className
	)}
	{...$$restProps}
	on:keydown>
	<div class="w-full p-1">
		<slot />
	</div>
</SelectPrimitive.Content>
