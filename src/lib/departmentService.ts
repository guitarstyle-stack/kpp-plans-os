import { doc, connectToSheet } from './googleSheets';

const SHEET_TITLE = 'Departments';

export interface Department {
    id: string;
    name: string;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cache: Department[] | null = null;
let lastFetchTime = 0;

export async function getDepartments(): Promise<Department[]> {
    const now = Date.now();
    if (cache && (now - lastFetchTime < CACHE_TTL)) {
        console.log('[Cache] Returning cached departments');
        return cache;
    }

    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLE];
    if (!sheet) throw new Error(`Sheet ${SHEET_TITLE} not found`);

    const rows = await sheet.getRows();
    const departments = rows.map((row) => ({
        id: row.get('id'),
        name: row.get('name'),
    }));

    cache = departments;
    lastFetchTime = now;
    console.log('[Cache] Miss - Fetched departments from Sheet');
    return departments;
}

export async function getDepartmentById(id: string): Promise<Department | null> {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLE];
    if (!sheet) return null;

    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === id);
    if (!row) return null;

    return {
        id: row.get('id'),
        name: row.get('name'),
    };
}

export async function addDepartment(name: string) {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLE];
    if (!sheet) throw new Error(`Sheet ${SHEET_TITLE} not found`);

    const id = Date.now().toString(); // Simple ID generation
    await sheet.addRow({ id, name });

    cache = null; // Invalidate cache

    try {
        const { logAudit } = await import('./auditService');
        await logAudit('ADMIN', 'CREATE', id, `Department created: ${name}`);
    } catch (e) { console.error(e); }

    return { id, name };
}

export async function updateDepartment(id: string, name: string) {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLE];
    if (!sheet) throw new Error(`Sheet ${SHEET_TITLE} not found`);

    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === id);
    if (!row) throw new Error('Department not found');

    row.assign({ name });
    await row.save();

    cache = null; // Invalidate cache

    try {
        const { logAudit } = await import('./auditService');
        await logAudit('ADMIN', 'UPDATE', id, `Department updated name to: ${name}`);
    } catch (e) { console.error(e); }

    return { id, name };
}

export async function deleteDepartment(id: string) {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLE];
    if (!sheet) throw new Error(`Sheet ${SHEET_TITLE} not found`);

    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === id);
    if (!row) throw new Error('Department not found');

    await row.delete();
    cache = null; // Invalidate cache

    try {
        const { logAudit } = await import('./auditService');
        await logAudit('ADMIN', 'DELETE', id, 'Department deleted');
    } catch (e) { console.error(e); }
}
