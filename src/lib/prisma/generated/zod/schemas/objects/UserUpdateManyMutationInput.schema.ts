import { z } from 'zod';
import { StringFieldUpdateOperationsInputObjectSchema } from './StringFieldUpdateOperationsInput.schema';
import { NullableStringFieldUpdateOperationsInputObjectSchema } from './NullableStringFieldUpdateOperationsInput.schema';
import { NullableDateTimeFieldUpdateOperationsInputObjectSchema } from './NullableDateTimeFieldUpdateOperationsInput.schema';
import { BoolFieldUpdateOperationsInputObjectSchema } from './BoolFieldUpdateOperationsInput.schema';
import { RoleSchema } from '../enums/Role.schema';
import { EnumRoleFieldUpdateOperationsInputObjectSchema } from './EnumRoleFieldUpdateOperationsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.UserUpdateManyMutationInput> = z
	.object({
		id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
		name: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)])
			.optional()
			.nullable(),
		email: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)])
			.optional()
			.nullable(),
		emailVerified: z
			.union([z.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputObjectSchema)])
			.optional()
			.nullable(),
		isInvited: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputObjectSchema)]).optional(),
		image: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)])
			.optional()
			.nullable(),
		role: z.union([z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputObjectSchema)]).optional(),
	})
	.strict();

export const UserUpdateManyMutationInputObjectSchema = Schema;
