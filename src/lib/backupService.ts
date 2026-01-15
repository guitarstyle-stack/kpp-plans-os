import { PrismaClient } from '@prisma/client';
import { doc, connectToSheet } from './googleSheets';

const prisma = new PrismaClient();

export async function backupToSheets() {
    console.log('Starting backup to Google Sheets...');

    try {
        await connectToSheet();

        // 1. Backup Projects
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const projectSheet = doc.sheetsByTitle['Projects'];
        if (projectSheet) {
            await projectSheet.clear();
            await projectSheet.setHeaderRow([
                'id', 'name', 'project_name', 'agency', 'description',
                'budget', 'budget_spent', 'start_date', 'end_date',
                'fiscal_year', 'status', 'progress', 'source',
                'target_group', 'responsible_person', 'last_updated'
            ]);

            const projectRows = projects.map(p => ({
                id: p.id,
                name: p.name,
                project_name: p.projectName || '',
                agency: p.agency,
                description: p.description || '',
                budget: p.budget.toString(),
                budget_spent: p.budgetSpent.toString(),
                start_date: p.startDate,
                end_date: p.endDate,
                fiscal_year: p.fiscalYear,
                status: p.status,
                progress: p.progress.toString(),
                source: p.source || '',
                target_group: p.targetGroup || '',
                responsible_person: p.responsiblePerson || '',
                last_updated: p.lastUpdated.toISOString()
            }));

            await projectSheet.addRows(projectRows);
            console.log(`Backed up ${projectRows.length} projects.`);
        }

        // 2. Backup Indicators
        const indicators = await prisma.indicator.findMany();
        const indicatorSheet = doc.sheetsByTitle['Indicators'];
        if (indicatorSheet) {
            await indicatorSheet.clear();
            await indicatorSheet.setHeaderRow(['id', 'name', 'target', 'unit', 'result', 'projectId']);

            const indicatorRows = indicators.map(i => ({
                id: i.id,
                name: i.name,
                target: i.target,
                unit: i.unit,
                result: i.result || '',
                projectId: i.projectId
            }));

            await indicatorSheet.addRows(indicatorRows);
            console.log(`Backed up ${indicatorRows.length} indicators.`);
        }

        return { success: true, timestamp: new Date() };

    } catch (error) {
        console.error('Backup failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}
