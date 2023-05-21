export { default as accordion } from './accordion';
export { default as form } from './form';

export type { Color } from './Color';
export { validateData } from './validateData';
export { merge } from './merge';
export { SvelteSubject } from './svelteSubject';

export const dateFormat = 'MM/dd/yyyy';

export const numberFormat = (
	locale: string | string[] = 'en-US',
	currency: Intl.NumberFormatOptions['currency'] = 'USD'
) => Intl.NumberFormat(locale, { style: 'currency', currency, notation: 'compact' });
