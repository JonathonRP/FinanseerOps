import {PrismaClient} from '@prisma/client';
import {admin} from './data/admin';

const db = new PrismaClient();

async function main() {
  await db.user.create({
    data: admin,
  });
}

export default main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async err => {
    console.log('error:', err);
    await db.$disconnect();
    process.exit(1);
  });
