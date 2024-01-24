import type { MotionProps } from 'svelte-motion';

export { staggerChildren } from './staggerChildren';
export { fadeUp } from './fadeUp';

export type ForwardMotionProps = { [P in keyof MotionProps]: MotionProps[P] }
