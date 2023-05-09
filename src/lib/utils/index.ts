export { default as accordion } from './accordion';
export { default as form } from './form';

export type { Color } from './Color';
export { validateData } from './validateData';
export { merge } from './merge';
export { SvelteSubject } from './svelteSubject';

export const dateFormat = 'MM/dd/yyyy';

export const numberFormat: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD', notation: 'compact' };
