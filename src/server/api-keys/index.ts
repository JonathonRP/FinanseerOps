import { ApiKeys } from 'svelte-api-keys';
import { DrizzleKeyStore } from './storage';
import { DrizzleBucket } from './buckets';

const storage = new DrizzleKeyStore();
const buckets = new DrizzleBucket();

export const api_keys = new ApiKeys(storage, buckets)