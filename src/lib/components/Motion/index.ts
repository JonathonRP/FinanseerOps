import type { SvelteHTMLElements } from 'svelte/elements';
import type { ComponentType, SvelteComponent } from 'svelte';

import Remotion from './Motion.svelte';
import type { DefaultPropsType } from './types';

type motion<Element extends keyof SvelteHTMLElements> = ComponentType<SvelteComponent<DefaultPropsType<Element>>>;

function createMotionProxy(): { [P in keyof SvelteHTMLElements]: motion<P> } {
	return new Proxy(
		{},
		{
			get(_target, key: string) {
				let type = false;
				if (key.toString().slice(0, 1) === key.toString().slice(0, 1).toLowerCase()) {
					type = isSVGComponent(key);
				}

				return new Proxy(Remotion, {
					construct(target, args) {
						if (!args || !args[0]) {
							args.push({});
						}
						if (!args[0]?.props) {
							args[0].props = { as: key, isSVG: type };
						} else {
							args[0].props.as = key;
							args[0].props.isSVG = type;
						}

						console.log(target, args);

						return new target(...args);
					},
					apply(target, thisArg, args) {
						if (!args[1]) {
							args[1] = { as: key, isSVG: type };
						} else {
							args[1].as = key;
							args[1].isSVG = type;
						}

						return target(...args);
					},
				});
			},
		}
	) as { [P in keyof SvelteHTMLElements]: motion<P> };
}

const MotionProxy = createMotionProxy();

export const Motion = MotionProxy;

/**
 * We keep these listed seperately as we use the lowercase tag names as part
 * of the runtime bundle to detect SVG components
 */
const lowercaseSVGElements = [
	'animate',
	'circle',
	'defs',
	'desc',
	'ellipse',
	'g',
	'image',
	'line',
	'filter',
	'marker',
	'mask',
	'metadata',
	'path',
	'pattern',
	'polygon',
	'polyline',
	'rect',
	'stop',
	'switch',
	'symbol',
	'svg',
	'text',
	'tspan',
	'use',
	'view',
];

function isSVGComponent(Component: string | ComponentType<SvelteComponent<any>>) {
	if (
		/**
		 * If it's not a string, it's a custom React component. Currently we only support
		 * HTML custom React components.
		 */
		typeof Component !== 'string' ||
		/**
		 * If it contains a dash, the element is a custom HTML webcomponent.
		 */
		Component.includes('-')
	) {
		return false;
	}
	if (
		/**
		 * If it's in our list of lowercase SVG tags, it's an SVG component
		 */
		lowercaseSVGElements.indexOf(Component) > -1 ||
		/**
		 * If it contains a capital letter, it's an SVG component
		 */
		/[A-Z]/u.test(Component)
	) {
		return true;
	}

	return false;
}
