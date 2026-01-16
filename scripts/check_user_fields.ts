import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('--- User Verification ---');
    users.forEach(u => {
        console.log(`User: ${u.username}`);
        console.log(`  Name: ${u.firstName} ${u.lastName}`);
        console.log(`  Phone: ${u.phoneNumber}`);
        console.log(`  Display Name: ${u.displayName}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
