import type { User } from '@prisma/client';

export const admin = {
	emailVerified: new Date(),
	isInvited: false,
	role: 'admin',
} satisfies Partial<User>;
