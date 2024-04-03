import { createClient, type RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { BehaviorSubject, filter, fromEventPattern, mergeMap, startWith, Subject } from 'rxjs';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/private';

const notificationsChanges$ = new Subject<RealtimePostgresChangesPayload<any>>();
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
supabase
	.channel('notifications-insert-delete')
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
export const notificationsChanges = notificationsChanges$.asObservable();
export const notificationsInsert = notificationsChanges.pipe(filter((payload) => payload?.eventType === 'INSERT'));
export const notificationsInsertDelete = notificationsChanges.pipe(
	filter((payload) => payload?.eventType === 'INSERT' || payload?.eventType === 'DELETE')
);
