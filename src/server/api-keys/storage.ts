import type { KeyInfoData, KeyStore } from 'svelte-api-keys';
import { eq } from 'drizzle-orm';
import { keys } from '../db/schema';
import { db } from '../db';

export class DrizzleKeyStore implements KeyStore {

	async put(hash: string, info: KeyInfoData) {
        await db.insert(keys).values({ hash, ...info }).onConflictDoUpdate({ target: keys.hash, set: info });
	}

	async get(hash: string) {
        return db.select().from(keys).where(eq(keys.hash, hash)).then(resp => resp.length ? resp[0] : null);
	}

	async del(hash: string) {
        await db.delete(keys).where(eq(keys.hash, hash));
	}

	async list(user: string) {
        return db.select().from(keys).where(eq(keys.user, user));
	}
}