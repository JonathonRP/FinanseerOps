import type { Session } from '@auth/sveltekit';
import { browser } from '$app/environment';

const getValue = () => (browser ? Boolean(JSON.parse(window.localStorage.getItem('useBauhaus') ?? 'null')) : undefined);
const setValue = (value: boolean) => browser && window.localStorage.setItem('useBauhaus', String(value));

class UserSettings {
	private usingBauhaus = $state(getValue() ?? false);

	get useBauhaus() {
		return this.usingBauhaus;
	}

	set useBauhaus(value: boolean) {
		setValue(value);
		this.usingBauhaus = value;
	}

	// eslint-disable-next-line class-methods-use-this
	genertateImage = $derived(
		(user: Session['user'] | undefined) =>
			user?.image ||
			`https://source.boringavatars.com/${(this.useBauhaus && 'bauhaus') || 'beam'}/120/${encodeURIComponent(
				user?.name ?? ''
			)}?colors=000000,ff3e00,CDCDCD,4075a6,${Math.floor(Math.random() * 0xffffff * 1000000)
				.toString(16)
				.slice(0, 6)}`
	);
}

export const userSettings = new UserSettings();
