import { z } from 'zod';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { StringNullableFilterObjectSchema } from './StringNullableFilter.schema';
import { DateTimeNullableFilterObjectSchema } from './DateTimeNullableFilter.schema';
import { BoolFilterObjectSchema } from './BoolFilter.schema';
import { EnumRoleFilterObjectSchema } from './EnumRoleFilter.schema';
import { RoleSchema } from '../enums/Role.schema';
import { AccountListRelationFilterObjectSchema } from './AccountListRelationFilter.schema';
import { SessionListRelationFilterObjectSchema } from './SessionListRelationFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.UserWhereInput> = z
	.object({
		AND: z
			.union([z.lazy(() => UserWhereInputObjectSchema), z.lazy(() => UserWhereInputObjectSchema).array()])
			.optional(),
		OR: z
			.lazy(() => UserWhereInputObjectSchema)
			.array()
			.optional(),
		NOT: z
			.union([z.lazy(() => UserWhereInputObjectSchema), z.lazy(() => UserWhereInputObjectSchema).array()])
			.optional(),
		id: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
		name: z
			.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
			.optional()
			.nullable(),
		email: z
			.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
			.optional()
			.nullable(),
		emailVerified: z
			.union([z.lazy(() => DateTimeNullableFilterObjectSchema), z.date()])
			.optional()
			.nullable(),
		isInvited: z.union([z.lazy(() => BoolFilterObjectSchema), z.boolean()]).optional(),
		image: z
			.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
			.optional()
			.nullable(),
		role: z.union([z.lazy(() => EnumRoleFilterObjectSchema), z.lazy(() => RoleSchema)]).optional(),
		accounts: z.lazy(() => AccountListRelationFilterObjectSchema).optional(),
		sessions: z.lazy(() => SessionListRelationFilterObjectSchema).optional(),
	})
	.strict();

export const UserWhereInputObjectSchema = Schema;
