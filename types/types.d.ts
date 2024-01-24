import type { DefaultSession } from '@auth/sveltekit';
import type { Users } from '../src/server/db';

type YFirst = 20; // change this if you accept dates outside of 19xx & 20xx years
const digits = [0,1,2,3,4,5,6,7,8,9] as const;
type Digit = typeof digits[number];

/**
 * Years
 */
type yyyy = `${20}${Digit}${Digit}`
/**
 * Months
 */
type MM = `${0}${Digit}` | `${1}${Extract<Digit, 0|1|2>}`
/**
 * Days
 */
type dd = `${0|1|2}${Digit}` | `${3}${0|1}`
/**
 * Hours
 */
type HH = `${0|1}${Digit}` | `${2}${Extract<Digit, 0|1|2|3|4>}`
/**
 * Minutes
 */
type mm = `${0|1|2|3|4|5}${Digit}`;
/**
 * Seconds
 */
type ss = mm;

/**
 * yyyy-MM-ddTHH:mm:ssZ
 */
type ISODateString = `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}Z`;

declare module '@auth/sveltekit' {
	export interface Session extends DefaultSession {
		user?: Users & DefaultSession['user'];
	}

	type AdapterUser = Users;
}
