import { z } from 'zod';
import { StringWithAggregatesFilterObjectSchema } from './StringWithAggregatesFilter.schema';
import { StringNullableWithAggregatesFilterObjectSchema } from './StringNullableWithAggregatesFilter.schema';
import { DateTimeNullableWithAggregatesFilterObjectSchema } from './DateTimeNullableWithAggregatesFilter.schema';
import { BoolWithAggregatesFilterObjectSchema } from './BoolWithAggregatesFilter.schema';
import { EnumRoleWithAggregatesFilterObjectSchema } from './EnumRoleWithAggregatesFilter.schema';
import { RoleSchema } from '../enums/Role.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z
	.object({
		AND: z
			.union([
				z.lazy(() => UserScalarWhereWithAggregatesInputObjectSchema),
				z.lazy(() => UserScalarWhereWithAggregatesInputObjectSchema).array(),
			])
			.optional(),
		OR: z
			.lazy(() => UserScalarWhereWithAggregatesInputObjectSchema)
			.array()
			.optional(),
		NOT: z
			.union([
				z.lazy(() => UserScalarWhereWithAggregatesInputObjectSchema),
				z.lazy(() => UserScalarWhereWithAggregatesInputObjectSchema).array(),
			])
			.optional(),
		id: z.union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()]).optional(),
		name: z
			.union([z.lazy(() => StringNullableWithAggregatesFilterObjectSchema), z.string()])
			.optional()
			.nullable(),
		email: z
			.union([z.lazy(() => StringNullableWithAggregatesFilterObjectSchema), z.string()])
			.optional()
			.nullable(),
		emailVerified: z
			.union([z.lazy(() => DateTimeNullableWithAggregatesFilterObjectSchema), z.date()])
			.optional()
			.nullable(),
		isInvited: z.union([z.lazy(() => BoolWithAggregatesFilterObjectSchema), z.boolean()]).optional(),
		image: z
			.union([z.lazy(() => StringNullableWithAggregatesFilterObjectSchema), z.string()])
			.optional()
			.nullable(),
		role: z.union([z.lazy(() => EnumRoleWithAggregatesFilterObjectSchema), z.lazy(() => RoleSchema)]).optional(),
	})
	.strict();

export const UserScalarWhereWithAggregatesInputObjectSchema = Schema;
