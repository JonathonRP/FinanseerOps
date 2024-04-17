import { eq } from 'drizzle-orm';
import type { Refill } from 'svelte-api-keys';
import { TokenBucket } from 'svelte-api-keys';
import { buckets } from '../db/schema';
import { db } from '../db';

export class DrizzleBucket extends TokenBucket {

	async consume(key: string, refill: Refill, count = 1) {
		const now = Date.now()

		let bucket = await db.select().from(buckets).where(eq(buckets.name, key)).then(resp => resp[0]);
		if (!bucket) {
            bucket = { name: key, tokens: refill.size, updated: now };
			await db.insert(buckets).values(bucket).onConflictDoUpdate({
                target: buckets.name,
                set: bucket
            })
		}

		const deltaMs = now - bucket.updated
		const deltaNo = (deltaMs * refill.rate) / 1000

		bucket.tokens = Math.min(refill.size, bucket.tokens + deltaNo)
		bucket.updated = now

		const allowed = bucket.tokens >= count
		if (allowed) {
			bucket.tokens -= count
		}

		return this.apply(refill, count, allowed, bucket.tokens)
	}
}