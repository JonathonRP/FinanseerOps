import { z } from 'zod';
import { AccountOrderByWithRelationInputObjectSchema } from './objects/AccountOrderByWithRelationInput.schema';
import { AccountWhereInputObjectSchema } from './objects/AccountWhereInput.schema';
import { AccountWhereUniqueInputObjectSchema } from './objects/AccountWhereUniqueInput.schema';
import { AccountCountAggregateInputObjectSchema } from './objects/AccountCountAggregateInput.schema';
import { AccountMinAggregateInputObjectSchema } from './objects/AccountMinAggregateInput.schema';
import { AccountMaxAggregateInputObjectSchema } from './objects/AccountMaxAggregateInput.schema';

export const AccountAggregateSchema = z.object({
	orderBy: z
		.union([AccountOrderByWithRelationInputObjectSchema, AccountOrderByWithRelationInputObjectSchema.array()])
		.optional(),
	where: AccountWhereInputObjectSchema.optional(),
	cursor: AccountWhereUniqueInputObjectSchema.optional(),
	take: z.number().optional(),
	skip: z.number().optional(),
	_count: z.union([z.literal(true), AccountCountAggregateInputObjectSchema]).optional(),
	_min: AccountMinAggregateInputObjectSchema.optional(),
	_max: AccountMaxAggregateInputObjectSchema.optional(),
});
