import { PrismaClient } from '@prisma/client';
import { admin } from './data/admin';

const db = new PrismaClient();

function normalizeIdentifier(identifier: string): string {
	// Get the first two elements only,
	// separated by `@` from user input.
	const [local, domain] = identifier.toLowerCase().trim().split('@');
	// The part before "@" can contain a ","
	// but we remove it on the domain part
	const [newDomain] = domain.split(',');
	return `${local}@${newDomain}`;

	// You can also throw an error, which will redirect the user
	// to the error page with error=EmailSignin in the URL
	// if (identifier.split("@").length > 2) {
	//   throw new Error("Only one email allowed")
	// }
}

if (!process.env.BUXFER_EMAIL) {
	throw new Error('Please define Buxfer Account Email');
}

const defaultUser = {
	email: process.env.BUXFER_EMAIL,
	...admin,
};

const mainAccount = {
	type: 'email',
	provider: 'buxfer',
	providerAccountId: normalizeIdentifier(process.env.BUXFER_EMAIL),
};

async function main() {
	await db.user.upsert({
		where: {
			email: defaultUser.email,
		},
		create: {
			...defaultUser,
			accounts: {
				create: mainAccount,
			},
		},
		update: {
			...defaultUser,
			accounts: {
				upsert: [
					{
						where: {
							provider_providerAccountId: {
								provider: mainAccount.type,
								providerAccountId: mainAccount.providerAccountId,
							},
						},
						create: mainAccount,
						update: mainAccount,
					},
				],
			},
		},
	});
}

export default main()
	.then(async () => {
		await db.$disconnect();
	})
	.catch(async (err) => {
		console.log('error:', err);
		await db.$disconnect();
		process.exit(1);
	});
