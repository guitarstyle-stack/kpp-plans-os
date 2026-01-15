import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Verifying migration...');

    // Check projects
    const projects = await prisma.project.findMany();
    console.log(`Projects found: ${projects.length}`);
    projects.forEach(p => console.log(`- ${p.name} (Budget: ${p.budget})`));

    if (projects.length === 0) {
        throw new Error('No projects found after migration!');
    }

    // Check indicators
    const indicators = await prisma.indicator.findMany();
    console.log(`Indicators found: ${indicators.length}`);

    console.log('Verification Passed ✅');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
