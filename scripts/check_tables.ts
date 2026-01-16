import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking table counts...');

    const models = [
        'department',
        'user',
        'project',
        'projectCategory',
        'strategicPlan',
        'strategicGoal',
        'strategicIndicator',
        'indicator',
        'report',
        'auditLog'
    ];

    for (const model of models) {
        // @ts-ignore
        const count = await prisma[model].count();
        console.log(`${model}: ${count} rows`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
