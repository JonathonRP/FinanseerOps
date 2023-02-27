import { z } from 'zod';
import { RoleSchema } from '../enums/Role.schema';
import { AccountCreateNestedManyWithoutUserInputObjectSchema } from './AccountCreateNestedManyWithoutUserInput.schema';
import { SessionCreateNestedManyWithoutUserInputObjectSchema } from './SessionCreateNestedManyWithoutUserInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.UserCreateInput> = z
	.object({
		id: z.string().optional(),
		name: z.string().optional().nullable(),
		email: z.string().optional().nullable(),
		emailVerified: z.date().optional().nullable(),
		isInvited: z.boolean().optional(),
		image: z.string().optional().nullable(),
		role: z.lazy(() => RoleSchema).optional(),
		accounts: z.lazy(() => AccountCreateNestedManyWithoutUserInputObjectSchema).optional(),
		sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputObjectSchema).optional(),
	})
	.strict();

export const UserCreateInputObjectSchema = Schema;
