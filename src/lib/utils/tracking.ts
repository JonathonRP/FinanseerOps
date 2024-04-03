import { Observable, combineLatest, defer, map, switchMap, tap } from 'rxjs';
import { type Transactions } from '../api';

export const tracking = (onNewRecord: (record: any) => void) => (source: Transactions) =>
	defer(() => {
		const state = source;
		return combineLatest([state, source]).pipe(
			tap(([state, next]) => {
				if (next.length > state.length) {
					onNewRecord(next.toSorted(({ date: a }, { date: b }) => a.getTime() - b.getTime()).pop());
				}
			}),
			switchMap(([state, next]) => {
				if (next.length > state.length) {
					state = next;
					return next;
				}
				return state;
			})
		);
	});
