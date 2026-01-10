
import { NextResponse } from 'next/server';
import { doc, connectToSheet } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';

const SHEET_TITLES = {
    PROJECTS: 'Projects',
    INDICATORS: 'Indicators',
    REPORTS: 'Reports',
};

const EXPECTED_HEADERS = {
    [SHEET_TITLES.PROJECTS]: ['id', 'name', 'agency', 'target_group', 'budget', 'source', 'status', 'progress', 'project_name', 'start_date', 'end_date', 'responsible_person', 'description', 'last_updated', 'fiscal_year'],
    [SHEET_TITLES.INDICATORS]: ['id', 'projectId', 'name', 'target', 'unit', 'result'],
    [SHEET_TITLES.REPORTS]: ['id', 'projectId', 'userId', 'submissionDate', 'progress', 'budgetSpent', 'performance', 'issues', 'indicatorResults'],
};

export async function GET() {
    try {
        await connectToSheet();
        const logs: string[] = [];

        // 1. Fix Reports Sheet
        let reportsSheet = doc.sheetsByTitle[SHEET_TITLES.REPORTS];
        if (!reportsSheet) {
            logs.push(`Creating missing sheet: ${SHEET_TITLES.REPORTS}`);
            reportsSheet = await doc.addSheet({ title: SHEET_TITLES.REPORTS });
            await reportsSheet.setHeaderRow(EXPECTED_HEADERS[SHEET_TITLES.REPORTS]);
        } else {
            logs.push(`Sheet ${SHEET_TITLES.REPORTS} exists.`);
        }

        // 2. Fix Projects Sheet
        const projectsSheet = doc.sheetsByTitle[SHEET_TITLES.PROJECTS];
        if (projectsSheet) {
            await projectsSheet.loadHeaderRow();
            const currentHeaders = projectsSheet.headerValues;
            const expected = EXPECTED_HEADERS[SHEET_TITLES.PROJECTS];

            // basic check: if we just need to append columns
            const missing = expected.filter(h => !currentHeaders.includes(h));
            if (missing.length > 0) {
                logs.push(`Updating Projects sheet headers. Adding: ${missing.join(', ')}`);
                // We append missing headers to the existing ones
                const newHeaders = [...currentHeaders, ...missing];
                await projectsSheet.setHeaderRow(newHeaders);
            } else {
                logs.push('Projects sheet headers OK.');
            }
        }

        // 3. Fix Indicators Sheet
        const indicatorsSheet = doc.sheetsByTitle[SHEET_TITLES.INDICATORS];
        if (indicatorsSheet) {
            await indicatorsSheet.loadHeaderRow();
            const headers = indicatorsSheet.headerValues;

            // Check if it's the legacy format
            if (headers.includes('project_id') && !headers.includes('projectId')) {
                logs.push('Detected legacy Indicators format. Migrating...');

                // Read all rows first
                const rows = await indicatorsSheet.getRows();
                const allData = rows.map(row => ({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5), // Generate generic ID
                    projectId: row.get('project_id'),
                    name: row.get('indicator_name'),
                    target: row.get('target_value'),
                    unit: '', // Default unit
                    result: row.get('current_value')
                }));

                // Clear sheet content (this keeps the sheet but clears data)
                await indicatorsSheet.clear();

                // Set new headers
                await indicatorsSheet.setHeaderRow(EXPECTED_HEADERS[SHEET_TITLES.INDICATORS]);

                // Add migrated rows
                for (const data of allData) {
                    await indicatorsSheet.addRow(data);
                }
                logs.push(`Migrated ${allData.length} indicator rows.`);
            } else {
                // Check for missing headers (like 'unit' if it was partially updated)
                const expected = EXPECTED_HEADERS[SHEET_TITLES.INDICATORS];
                const missing = expected.filter(h => !headers.includes(h));
                if (missing.length > 0) {
                    logs.push(`Updating Indicators sheet headers. Adding: ${missing.join(', ')}`);
                    const newHeaders = [...headers, ...missing];
                    await indicatorsSheet.setHeaderRow(newHeaders);
                } else {
                    logs.push('Indicators sheet headers OK.');
                }
            }
        }

        return NextResponse.json({ success: true, logs });
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
