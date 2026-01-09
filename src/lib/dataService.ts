import { doc, connectToSheet } from './googleSheets';

const SHEET_TITLES = {
    PROJECTS: 'Projects',
    INDICATORS: 'Indicators',
};

export interface Project {
    id: string;
    name: string;
    agency: string;
    target_group: string;
    budget: string;
    source: string;
    status: string;
    progress: string;
    start_date: string;
    end_date: string;
    last_updated: string;
    fiscal_year: string;
    _rowIndex?: number;
}

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
        start_date: row.get('start_date'),
        end_date: row.get('end_date'),
        last_updated: row.get('last_updated'),
        fiscal_year: row.get('fiscal_year'),
        _rowIndex: (row as any).rowIndex,
    }));
}

export async function updateProject(id: string, updates: Partial<Project>) {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLES.PROJECTS];
    if (!sheet) throw new Error(`Sheet ${SHEET_TITLES.PROJECTS} not found`);

    const rows = await sheet.getRows();
    const row = rows.find((r) => r.get('id') === id);

    if (!row) throw new Error(`Project with ID ${id} not found`);

    Object.keys(updates).forEach((key) => {
        if (key !== 'id' && key !== '_rowIndex') {
            row.assign({ [key]: updates[key as keyof Project] });
        }
    });
    row.assign({ last_updated: new Date().toISOString() });

    await row.save();
    return row;
}

export async function addProject(projectData: Partial<Project>) {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLES.PROJECTS];
    if (!sheet) throw new Error(`Sheet ${SHEET_TITLES.PROJECTS} not found`);

    const newRow = await sheet.addRow({
        id: projectData.id || Date.now().toString(),
        ...projectData,
        last_updated: new Date().toISOString()
    });
    return newRow;
}
