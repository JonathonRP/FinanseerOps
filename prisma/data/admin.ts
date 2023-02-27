import { Role } from '@prisma/client';

export const admin = {
	emailVerified: new Date(),
	isInvited: false,
	role: Role.admin,
};
