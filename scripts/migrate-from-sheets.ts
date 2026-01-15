
import { PrismaClient } from '@prisma/client';
import { doc, connectToSheet } from '../src/lib/googleSheets';

const prisma = new PrismaClient();

async function main() {
    console.log('Start migration...');

    // Connect to Google Sheets
    await connectToSheet();

    // 1. Migrate Projects
    const projectSheet = doc.sheetsByTitle['Projects'];
    if (!projectSheet) throw new Error('Projects sheet not found');

    const projectRows = await projectSheet.getRows();
    console.log(`Found ${projectRows.length} projects to migrate.`);

    for (const row of projectRows) {
        // Parse numeric values (remove commas, handle empty strings)
        const budget = row.get('budget') ? parseFloat(row.get('budget').replace(/,/g, '')) : 0;
        const budgetSpent = row.get('budget_spent') ? parseFloat(row.get('budget_spent').replace(/,/g, '')) : 0;
        const progress = row.get('progress') ? parseFloat(row.get('progress')) : 0;

        await prisma.project.create({
            data: {
                id: row.get('id') || undefined, // Allow Prisma to generate CUID if ID missing, or use existing for consistency
                name: row.get('name') || 'Untitled',
                projectName: row.get('project_name'),
                agency: row.get('agency') || '',
                description: row.get('description'),
                budget: isNaN(budget) ? 0 : budget,
                budgetSpent: isNaN(budgetSpent) ? 0 : budgetSpent,
                startDate: row.get('start_date') || '',
                endDate: row.get('end_date') || '',
                fiscalYear: row.get('fiscal_year') || '',
                status: row.get('status') || 'Not Started',
                progress: isNaN(progress) ? 0 : progress,
                source: row.get('source'),
                targetGroup: row.get('target_group'),
                responsiblePerson: row.get('responsible_person'),
                lastUpdated: row.get('last_updated') ? new Date(row.get('last_updated')) : new Date()
            }
        });
    }
    console.log('Projects migrated.');

    // 2. Migrate Indicators
    const indicatorSheet = doc.sheetsByTitle['Indicators'];
    if (indicatorSheet) {
        const indicatorRows = await indicatorSheet.getRows();
        console.log(`Found ${indicatorRows.length} indicators to migrate.`);

        for (const row of indicatorRows) {
            const projectId = row.get('projectId');
            if (!projectId) continue;

            // Check if project exists (orphaned indicators fix)
            const projectExists = await prisma.project.findUnique({ where: { id: projectId } });
            if (projectExists) {
                await prisma.indicator.create({
                    data: {
                        id: row.get('id'),
                        name: row.get('name') || 'Unnamed Indicator',
                        target: row.get('target') || '',
                        unit: row.get('unit') || '',
                        result: row.get('result') || '',
                        projectId: projectId
                    }
                });
            }
        }
        console.log('Indicators migrated.');
    }

    // 3. Migrate Reports (Optional: if Report sheet exists)
    const reportSheet = doc.sheetsByTitle['Reports'];
    if (reportSheet) {
        const reportRows = await reportSheet.getRows();
        console.log(`Found ${reportRows.length} reports to migrate.`);
        for (const row of reportRows) {
            const projectId = row.get('projectId');
            const projectExists = await prisma.project.findUnique({ where: { id: projectId } });
            if (!projectExists) continue;

            await prisma.report.create({
                data: {
                    id: row.get('id'),
                    projectId: projectId,
                    progress: parseFloat(row.get('progress') || '0'),
                    budgetSpent: parseFloat(row.get('budgetSpent') || '0'),
                    performance: row.get('performance'),
                    issues: row.get('issues'),
                    createdAt: row.get('timestamp') ? new Date(row.get('timestamp')) : new Date()
                }
            })
        }
        console.log('Reports migrated.');
    }

    console.log('Migration completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
