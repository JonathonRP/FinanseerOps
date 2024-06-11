import { createContext } from '$/server/api/context.js';
import { appRouter, createCallerFactory } from '$/server/api/root.js';
import { combineLatest, fromEventPattern, takeUntil, merge, zip, concat, startWith } from 'rxjs';
import { produce } from 'sveltekit-sse';

export function POST({ request, ...event }) {
	const api = createCallerFactory(appRouter)(createContext({ request, ...event }));
	const abort = fromEventPattern(
		(handle) => request.signal.addEventListener('abort', handle),
		(handle) => request.signal.removeEventListener('abort', handle)
	);

	return produce(
		async function start({ emit, lock }) {
			try {
				await new Promise(async (resolve, reject) => {
					const notifications = await api.user.notifications();
					const notificationsUnreadCount = await api.user.unreadNotificationsCount();
					const latestNotification = await api.user.latestNotification();

					return merge(combineLatest([notifications, notificationsUnreadCount]), latestNotification)
						.pipe(takeUntil(abort))
						.subscribe({
							next: (result) => {
								let error;
								let messages;
								let unreadCount;
								let latestNotification;
								Array.isArray(result) ? ([messages, unreadCount] = result) : (latestNotification = result);

								if (messages && unreadCount) {
									({ error } = emit('unreadCount', JSON.stringify(unreadCount)));
									({ error } = emit('messages', JSON.stringify(messages)));
								}
								if (latestNotification) {
									({ error } = emit('latestNotification', JSON.stringify(latestNotification)));
								}
								if (error) {
									reject(error);
								}
							},
							complete: () => {
								resolve(undefined);
							},
						});
				});
			} catch (err) {
				lock.set(false);
				return function cancel() {
					console.error(err.message);
				};
			}

			lock.set(false);
			return function cancel() {
				console.log('Stream canceled.');
			};
		},
		{
			headers: {
				'X-Accel-Buffering': 'no',
			},
		}
	);
}
