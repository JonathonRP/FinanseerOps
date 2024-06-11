import superjson from 'superjson';

superjson.registerCustom<Temporal.Instant, string>(
	{
		isApplicable: (v): v is Temporal.Instant => v instanceof Temporal.Instant,
		serialize: (v) => v.toJSON(),
		deserialize: (v) => Temporal.Instant.from(v),
	},
	'Temporal.Instant'
);

superjson.registerCustom<Temporal.ZonedDateTime, string>(
	{
		isApplicable: (v): v is Temporal.ZonedDateTime => v instanceof Temporal.ZonedDateTime,
		serialize: (v) => v.toJSON(),
		deserialize: (v) => Temporal.ZonedDateTime.from(v),
	},
	'Temporal.ZonedDateTime'
);

superjson.registerCustom<Temporal.PlainDate, string>(
	{
		isApplicable: (v): v is Temporal.PlainDate => v instanceof Temporal.PlainDate,
		serialize: (v) => v.toJSON(),
		deserialize: (v) => Temporal.PlainDate.from(v),
	},
	'Temporal.PlainDate'
);

export const transformer = {
	...superjson,
	// input: {
	// 	serialize: (object: unknown) => stringify(object),
	// 	deserialize: (object: string) => parse(object) as unknown,
	// },
	// output: {
	// 	serialize: (object: unknown) => uneval(object),
	// 	deserialize: (object: string) => (0, eval)(`(${object})`) as unknown,
	// },
	// --------------------------------------------------------------------------------------
	// serialize: (object: unknown) => uneval(object),
	// eslint-disable-next-line no-eval
	// deserialize: (object: string) => eval(`(${object})`),

	// serialize: (object: unknown) => {
	// 	const result = uneval(object);
	// 	console.log(object, result);
	// 	return result;
	// },
	// deserialize: (object: string) => {
	// 	// eslint-disable-next-line no-eval
	// 	const result = eval(`(${object})`);
	// 	console.log(object, result);
	// 	return result;
	// },
};
