
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
        const results = {
            success: true,
            sheets: {} as Record<string, unknown>,
            missingSheets: [] as string[],
            errors: [] as string[]
        };

        for (const [, title] of Object.entries(SHEET_TITLES)) {
            const sheet = doc.sheetsByTitle[title];
            if (!sheet) {
                results.missingSheets.push(title);
                results.errors.push(`Missing sheet: ${title}`);
                continue;
            }

            await sheet.loadHeaderRow();
            const headers = sheet.headerValues;
            const expected = EXPECTED_HEADERS[title];
            const missingHeaders = expected.filter(h => !headers.includes(h));

            results.sheets[title] = {
                exists: true,
                headers: headers,
                missingHeaders: missingHeaders,
                status: missingHeaders.length === 0 ? 'OK' : 'MISSING_HEADERS'
            };

            if (missingHeaders.length > 0) {
                results.success = false;
                results.errors.push(`Sheet '${title}' missing headers: ${missingHeaders.join(', ')}`);
            }
        }

        if (results.missingSheets.length > 0) {
            results.success = false;
        }

        return NextResponse.json(results);
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
