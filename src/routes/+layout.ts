import { addIcon } from 'iconify-icon';
import dummy from '@iconify-icons/tabler/2fa';

export async function load(event) {
	addIcon('dummy', dummy);

	return {
		...event.data,
		url: event.url,
	};
}
