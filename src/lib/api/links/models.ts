import type { OperationContext } from '@trpc/client';

export interface JwtPair {
	access: string;
	refresh: string;
}

export interface RefreshTokenLinkOptions {
	/**
	 * Get locally stored refresh token
	 * @returns Refresh token string or undefined
	 */
	getRefreshToken: (options: OperationContext) => Promise<string | undefined>;

	/**
	 * Fetch a new JWT pair by refresh token from your API
	 * @param refreshToken Refresh token to use as an input for the API
	 * @returns A promise resolving to `{ access: string; refresh: string }`
	 */
	fetchJwtPairByRefreshToken: (refreshToken: string) => Promise<JwtPair>;

	/**
	 * Callback on JWT pair is successfully fetched with `fetchJwtPairByRefreshToken`
	 * @param payload Just fetched `{ access: string; refresh: string }` structure
	 */
	onJwtPairFetched: (options: OperationContext, payload: JwtPair, email: string | undefined) => Promise<void>;

	/**
	 * Callback on JWT refresh request is failed
	 * @param error The error refresh query is failed with
	 */
	onRefreshFailed?: (error: unknown) => void;

	/**
	 * Callback on a request is failed with UNAUTHORIZED code,
	 * before the refresh flow is started
	 */
	onUnauthorized?: () => void;
}
