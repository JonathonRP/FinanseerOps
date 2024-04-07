<svelte:options runes={true} />

<script lang="ts" generics="V">
	import { cn } from '$lib/utils';

	import type { SvelteHTMLElements } from 'svelte/elements';

	import { Motion , useMotionValue } from 'svelte-motion';
		import { getContext } from 'svelte';
	import type { DefaultPropsType } from '.';

	import { invariant, isMotionValue, useTransform } from './utils';
	import type { ReorderContextProps } from './types';

	type Props<V> = {
		/**
		 * A HTML element to render this component as. Defaults to `"li"`.
		 *
		 * @public
		 */
		as?: keyof SvelteHTMLElements;

		/**
		 * The value in the list that this component represents.
		 *
		 * @public
		 */
		value: V;

		/**
		 * A subset of layout options primarily used to disable layout="size"
		 *
		 * @public
		 * @default true
		 */
		layout?: true | 'position';
	};

	const {
		children,
		value,
		as = 'li',
		layout = true,
		style = {},
		onDrag,
		class: className,
		...remotion
	}: Props<V> & DefaultPropsType = $props();

	const context = getContext<ReorderContextProps<V>>('Reorder');
	const point = $state({
		x: useDefaultMotionValue(style?.x),
		y: useDefaultMotionValue(style?.y),
	});

	const zIndex = useTransform([point.x, point.y], ([latestX, latestY]) => (latestX || latestY ? 10 : 'unset'));

	invariant(Boolean(context), 'Reorder.Item must be a child of Reorder.Group');

	const { axis, registerItem, updateOrder } = $derived(context);

	function useDefaultMotionValue(value: any, defaultValue: number = 0) {
		return isMotionValue(value) ? value : useMotionValue(defaultValue);
	}
</script>

<Motion
	drag={axis}
	{...remotion}
	style={{
		...style,
		x: point.x,
		y: point.y,
		zIndex,
	}}
	{layout}
	onDrag={(event, gesturePoint) => {
		event.stopPropagation();

		const { velocity } = gesturePoint;
		velocity[axis] && updateOrder(value, point[axis].get(), velocity[axis]);

		onDrag && onDrag(event, gesturePoint);
	}}
	onLayoutMeasure={(measured) => registerItem(value, measured)}
	dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
	dragElastic={0.88}
	_dragX={point.x}
	_dragY={point.y}
	whileDrag={{
		scale: 1.025,
	}}
	dragTransition={{
		bounceDamping: 15,
		bounceStiffness: 200,
		min: 0,
		max: 50,
		power: 0.88,
	}}
	let:motion={animate}>
	<svelte:element this={as} class={className} use:animate>
		{@render children()}
	</svelte:element>
</Motion>
