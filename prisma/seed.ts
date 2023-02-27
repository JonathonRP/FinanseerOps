import { PrismaClient } from '@prisma/client';
import { admin } from './data/admin';

const db = new PrismaClient();

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
	providerAccountId: process.env.BUXFER_EMAIL.normalize(),
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
								provider: mainAccount.provider,
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
