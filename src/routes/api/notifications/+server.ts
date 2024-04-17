import { createContext } from '$/server/api/context.js';
import { appRouter, createCallerFactory } from '$/server/api/root.js';
import { combineLatest, fromEventPattern, takeUntil } from 'rxjs';
import { events } from 'sveltekit-sse';

export function POST({ request, ...event }) {
	return events({
		request,
		headers: {
			'X-Accel-Buffering': 'no',
		},
		timeout: 0,
		async start({ emit, lock }) {
			const api = createCallerFactory(appRouter)(createContext({ request, ...event }));
			const abort = fromEventPattern(
				(handle) => request.signal.addEventListener('abort', handle),
				(handle) => request.signal.removeEventListener('abort', handle)
			);

			try {
				await new Promise(async (resolve, reject) => {
					const notifications = await api.user.notifications();
					const notificationsUnreadCount = await api.user.unreadNotificationsCount();
					const latestNotification = await api.user.latestNotification();

					combineLatest([notifications, notificationsUnreadCount])
						.pipe(takeUntil(abort))
						.subscribe({
							next: ([messages, unreadCount]) => {
								let error;
								({ error } = emit('unreadCount', JSON.stringify(unreadCount)));
								({ error } = emit('messages', JSON.stringify(messages)));
								if (error) {
									reject(error);
								}
							},
							complete: () => {
								resolve(undefined);
							},
						});
					latestNotification.pipe(takeUntil(abort)).subscribe({
						next: (message) => {
							const { error } = emit('message', JSON.stringify(message));
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
	});
}
