import type { Session } from '@auth/sveltekit';
import { browser } from '$app/environment';

const getValue = <V extends keyof UserSettings>(value: V) =>
	(browser ? JSON.parse(window.localStorage.getItem('userSettings') ?? 'null') : undefined)?.[
		value
	] satisfies UserSettings[V];
const setValue = (value: UserSettings) => browser && window.localStorage.setItem('userSettings', JSON.stringify(value));

class UserSettings {
	private useBauhausValue = $state(getValue('useBauhaus') ?? false);
	private budgetValue = $state(getValue('budget') ?? 2000);

	get budget() {
		return this.budgetValue;
	}

	set budget(value: number) {
		setValue({ ...this, budgetValue: value });
		this.budgetValue = value;
	}

	get useBauhaus() {
		return this.useBauhausValue;
	}

	set useBauhaus(value: boolean) {
		setValue({ ...this, useBauhausValue: value });
		this.useBauhausValue = value;
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
