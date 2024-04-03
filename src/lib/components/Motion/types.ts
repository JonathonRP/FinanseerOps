import type { MotionProps } from 'svelte-motion';
import type { SvelteHTMLElements } from 'svelte/elements';
import type { DefaultPropsType as DefaultComponentProps } from '..';

export type DefaultPropsType<Element extends keyof SvelteHTMLElements> = MotionProps &
	Partial<Pick<DefaultComponentProps, 'children'> & { class: string }> &
	Omit<SvelteHTMLElements[Element], 'style'>;
