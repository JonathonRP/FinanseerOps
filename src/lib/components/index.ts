import type { ClassValue } from 'clsx';
import type { Snippet } from 'svelte';

export { default as AnimatedNumber } from './AnimatedNumber.svelte';
export { default as Banner } from './Banner.svelte';
export { default as ResizePanel } from './ResizePanel.svelte';
export { Motion } from './Motion';
export { Reorder } from './Reorder';

export type DefaultPropsType = {
	children: Snippet;
	class?: ClassValue;
};
