import { doc, connectToSheet } from './googleSheets';
import { Project, Indicator, ProjectReport } from './types';

const SHEET_TITLES = {
    PROJECTS: 'Projects',
    INDICATORS: 'Indicators',
    REPORTS: 'Reports',
};

export async function getProjects(): Promise<Project[]> {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLES.PROJECTS];
    if (!sheet) throw new Error(`Sheet ${SHEET_TITLES.PROJECTS} not found`);

    const rows = await sheet.getRows();
    return rows.map((row) => ({
        id: row.get('id'),
        name: row.get('name'),
        agency: row.get('agency'),
        target_group: row.get('target_group'),
        budget: row.get('budget'),
        source: row.get('source'),
        status: row.get('status'),
        progress: row.get('progress'),
        project_name: row.get('project_name'),
        start_date: row.get('start_date'),
        end_date: row.get('end_date'),
        responsible_person: row.get('responsible_person'),
        description: row.get('description'),
        last_updated: row.get('last_updated'),
        fiscal_year: row.get('fiscal_year'),
        _rowIndex: (row as unknown as { rowIndex: number }).rowIndex,
    }));
}

export async function addProject(project: Omit<Project, '_rowIndex'>) {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLES.PROJECTS];
    if (!sheet) throw new Error(`Sheet ${SHEET_TITLES.PROJECTS} not found`);

    const newRow = await sheet.addRow({
        id: project.id,
        name: project.name || '',
        agency: project.agency || '',
        target_group: project.target_group || '',
        budget: project.budget || '',
        source: project.source || '',
        status: project.status || '',
        progress: project.progress || '',
        project_name: project.project_name || '',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        responsible_person: project.responsible_person || '',
        description: project.description || '',
        last_updated: project.last_updated || '',
        fiscal_year: project.fiscal_year || '',
    });
    return newRow;
}

export async function updateProject(project: Partial<Project>) {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLES.PROJECTS];
    if (!sheet) throw new Error(`Sheet ${SHEET_TITLES.PROJECTS} not found`);

    const rows = await sheet.getRows();
    const row = rows.find((r) => r.get('id') === project.id);

    if (row) {
        row.assign({
            name: project.name || '',
            agency: project.agency || '',
            target_group: project.target_group || '',
            budget: project.budget || '',
            source: project.source || '',
            status: project.status || '',
            progress: project.progress || '',
            project_name: project.project_name || '',
            start_date: project.start_date || '',
            end_date: project.end_date || '',
            responsible_person: project.responsible_person || '',
            description: project.description || '',
            last_updated: new Date().toISOString(),
            fiscal_year: project.fiscal_year || '',
        });
        await row.save();
        return row;
    }
    throw new Error('Project not found');
}

export async function deleteProject(id: string) {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLES.PROJECTS];
    if (!sheet) throw new Error(`Sheet ${SHEET_TITLES.PROJECTS} not found`);

    const rows = await sheet.getRows();
    const row = rows.find((r) => r.get('id') === id);

    if (row) {
        await row.delete();
        return { success: true };
    }
    throw new Error('Project not found');
}

export async function getIndicators(projectId: string): Promise<Indicator[]> {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLES.INDICATORS];
    if (!sheet) throw new Error(`Sheet ${SHEET_TITLES.INDICATORS} not found`);

    const rows = await sheet.getRows();
    const allIndicators = rows.map((row) => ({
        id: row.get('id'),
        projectId: row.get('projectId'),
        name: row.get('name'),
        target: row.get('target'),
        unit: row.get('unit'),
        result: row.get('result'),
        _rowIndex: (row as unknown as { rowIndex: number }).rowIndex,
    }));

    return allIndicators.filter(ind => ind.projectId === projectId);
}

export async function updateIndicators(projectId: string, indicators: Omit<Indicator, '_rowIndex'>[]) {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLES.INDICATORS];
    if (!sheet) throw new Error(`Sheet ${SHEET_TITLES.INDICATORS} not found`);

    const rows = await sheet.getRows();
    const existingRows = rows.filter(row => row.get('projectId') === projectId);

    const newIds = new Set(indicators.filter(i => i.id).map(i => i.id));
    const rowsToDelete = existingRows.filter(row => !newIds.has(row.get('id')));
    for (const row of rowsToDelete) {
        await row.delete();
    }

    for (const ind of indicators) {
        if (ind.id && existingRows.some(r => r.get('id') === ind.id)) {
            const row = existingRows.find(r => r.get('id') === ind.id);
            if (row) {
                row.assign({
                    name: ind.name,
                    target: ind.target,
                    unit: ind.unit,
                    result: ind.result || ''
                });
                await row.save();
            }
        } else {
            await sheet.addRow({
                id: ind.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
                projectId: projectId,
                name: ind.name,
                target: ind.target,
                unit: ind.unit,
                result: ind.result || ''
            });
        }
    }
}

export async function addReport(reportData: Omit<ProjectReport, 'id' | '_rowIndex'>) {
    await connectToSheet();

    // 1. Add Report Row
    const reportsSheet = doc.sheetsByTitle[SHEET_TITLES.REPORTS];
    if (!reportsSheet) throw new Error(`Sheet ${SHEET_TITLES.REPORTS} not found`);

    const newReportRow = await reportsSheet.addRow({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        projectId: reportData.projectId,
        userId: reportData.userId,
        submissionDate: reportData.submissionDate,
        progress: reportData.progress.toString(),
        budgetSpent: reportData.budgetSpent.toString(),
        performance: reportData.performance,
        issues: reportData.issues,
        indicatorResults: JSON.stringify(reportData.indicatorResults)
    });

    // 2. Update Project Progress
    const projectsSheet = doc.sheetsByTitle[SHEET_TITLES.PROJECTS];
    if (!projectsSheet) throw new Error(`Sheet ${SHEET_TITLES.PROJECTS} not found`);
    const projectRows = await projectsSheet.getRows();
    const projectRow = projectRows.find(r => r.get('id') === reportData.projectId);

    if (projectRow) {
        projectRow.assign({
            progress: reportData.progress.toString(),
            last_updated: new Date().toISOString()
        });
        await projectRow.save();
    }

    // 3. Update Indicators (Latest Result)
    const indicatorsSheet = doc.sheetsByTitle[SHEET_TITLES.INDICATORS];
    if (indicatorsSheet) {
        const indRows = await indicatorsSheet.getRows();
        const projectIndRows = indRows.filter(r => r.get('projectId') === reportData.projectId);

        for (const [indId, result] of Object.entries(reportData.indicatorResults)) {
            const row = projectIndRows.find(r => r.get('id') === indId);
            if (row) {
                row.assign({ result: result });
                await row.save();
            }
        }
    }

    return newReportRow;
}

export async function getReportsByProject(projectId: string): Promise<ProjectReport[]> {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLES.REPORTS];
    if (!sheet) return [];

    const rows = await sheet.getRows();
    const projectRows = rows.filter(row => row.get('projectId') === projectId);

    return projectRows.map(row => ({
        id: row.get('id'),
        projectId: row.get('projectId'),
        userId: row.get('userId'),
        submissionDate: row.get('submissionDate'),
        progress: parseFloat(row.get('progress') || '0'),
        budgetSpent: parseFloat(row.get('budgetSpent') || '0'),
        performance: row.get('performance'),
        issues: row.get('issues'),
        indicatorResults: JSON.parse(row.get('indicatorResults') || '{}'),
        _rowIndex: (row as unknown as { rowIndex: number }).rowIndex,
    }));
}
