
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    try {
        const count = await prisma.project.count();
        const users = await prisma.user.count();
        console.log(`Projects in DB: ${count}`);
        console.log(`Users in DB: ${users}`);

        if (count > 0) {
            const sample = await prisma.project.findFirst();
            console.log('Sample Project:', sample?.name);
            console.log('Sample Agency:', sample?.agency);
        }
    } catch (e) {
        console.log('Error connecting to DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
