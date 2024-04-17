import { createClient, type RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { filter, Subject } from 'rxjs';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/private';

const notificationsChanges$ = new Subject<RealtimePostgresChangesPayload<any>>();
const userChanges$ = new Subject<RealtimePostgresChangesPayload<any>>();

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
supabase
	.channel('notifications')
	.on(
		'postgres_changes',
		{
			event: '*',
			schema: 'public',
			table: 'notifications',
		},
		(payload) => {
			notificationsChanges$.next(payload);
		}
	)
	.subscribe();
supabase.channel('user').on(
	'postgres_changes',
	{
		event: '*',
		schema: 'public',
		table: 'user',
	},
	(payload) => {
		userChanges$.next(payload);
	}
);

export const notificationsChanges = notificationsChanges$.asObservable();
export const userChanges = userChanges$.asObservable();

export const notificationsInserted = notificationsChanges.pipe(filter((payload) => payload?.eventType === 'INSERT'));
export const notificationsInsertedOrDeleted = notificationsChanges.pipe(
	filter((payload) => payload?.eventType === 'INSERT' || payload?.eventType === 'DELETE')
);

export const userUpdated = userChanges.pipe(filter((payload) => payload?.eventType === 'UPDATE'));
