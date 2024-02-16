import { createContext } from '$/server/api/context.js';
import { appRouter, createCallerFactory } from '$/server/api/root.js';
import { fromEventPattern, takeUntil } from 'rxjs';
import { events } from 'sveltekit-sse';

export function POST({ request, ...event }) {
	return events({
		request,
		start({ emit }) {
			const api = createCallerFactory(appRouter)(createContext({request, ...event}));
			const abort = fromEventPattern(
				(handle) => request.signal.addEventListener('abort', handle),
				(handle) => request.signal.removeEventListener('abort', handle)
			);

			api.user.notifications()
				.then((notifications) => 
				notifications
					.pipe(
						takeUntil(
							abort
						)
					)
					.subscribe({
						next: (value) => {
							emit('message', JSON.stringify(value));
							console.log(value);
						}
					})
				);

			api.user.unreadNotificationsCount()
				.then((result) =>
					result
						.pipe(
							takeUntil(
								abort
							)
						)
						.subscribe({
							next: (value) => {
								emit('count', JSON.stringify(value));
								console.log(value);
							},
						})
				);
		},
	});
}
