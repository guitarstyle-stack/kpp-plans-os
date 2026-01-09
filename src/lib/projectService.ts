import { doc, connectToSheet } from './googleSheets';
import { Project } from './types';

const SHEET_TITLE = 'Projects';

// Create new project
export async function createProject(projectData: Partial<Project>): Promise<Project> {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLE];

    if (!sheet) {
        throw new Error('Projects sheet not found');
    }

    const id = Date.now().toString();
    const newProject = {
        id,
        name: projectData.project_name || projectData.name || '',
        agency: projectData.agency || '',
        budget: projectData.budget || '0',
        start_date: projectData.start_date || '',
        end_date: projectData.end_date || '',
        status: projectData.status || 'Not Started',
        progress: projectData.progress || '0',
        fiscal_year: projectData.fiscal_year || '',
        target_group: projectData.description || '',
        source: projectData.responsible_person || '',
        last_updated: new Date().toISOString()
    };

    await sheet.addRow(newProject);

    // Log audit
    try {
        const { logAudit } = await import('./auditService');
        await logAudit('ADMIN', 'CREATE', id, `Project created: ${newProject.name}`);
    } catch (e) {
        console.error('Failed to log audit', e);
    }

    return newProject as Project;
}

// Update existing project
export async function updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLE];

    if (!sheet) {
        throw new Error('Projects sheet not found');
    }

    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === id);

    if (!row) {
        throw new Error('Project not found');
    }

    // Update fields
    if (projectData.project_name !== undefined || projectData.name !== undefined) {
        row.set('name', projectData.project_name || projectData.name);
    }
    if (projectData.agency !== undefined) row.set('agency', projectData.agency);
    if (projectData.budget !== undefined) row.set('budget', projectData.budget);
    if (projectData.start_date !== undefined) row.set('start_date', projectData.start_date);
    if (projectData.end_date !== undefined) row.set('end_date', projectData.end_date);
    if (projectData.status !== undefined) row.set('status', projectData.status);
    if (projectData.progress !== undefined) row.set('progress', projectData.progress);
    if (projectData.fiscal_year !== undefined) row.set('fiscal_year', projectData.fiscal_year);
    if (projectData.responsible_person !== undefined) row.set('source', projectData.responsible_person);
    if (projectData.description !== undefined) row.set('target_group', projectData.description);
    row.set('last_updated', new Date().toISOString());

    await row.save();

    // Log audit
    try {
        const { logAudit } = await import('./auditService');
        await logAudit('ADMIN', 'UPDATE', id, `Project updated: ${row.get('name')}`);
    } catch (e) {
        console.error('Failed to log audit', e);
    }

    return {
        id: row.get('id'),
        name: row.get('name'),
        agency: row.get('agency'),
        budget: row.get('budget'),
        start_date: row.get('start_date'),
        end_date: row.get('end_date'),
        status: row.get('status'),
        progress: row.get('progress'),
        fiscal_year: row.get('fiscal_year'),
        target_group: row.get('target_group'),
        source: row.get('source'),
        last_updated: row.get('last_updated')
    } as Project;
}

// Delete project
export async function deleteProject(id: string): Promise<void> {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLE];

    if (!sheet) {
        throw new Error('Projects sheet not found');
    }

    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === id);

    if (!row) {
        throw new Error('Project not found');
    }

    const projectName = row.get('name');
    await row.delete();

    // Log audit
    try {
        const { logAudit } = await import('./auditService');
        await logAudit('ADMIN', 'DELETE', id, `Project deleted: ${projectName}`);
    } catch (e) {
        console.error('Failed to log audit', e);
    }
}

// Update project progress (for users)
export async function updateProjectProgress(id: string, progress: string, userId: string): Promise<Project> {
    await connectToSheet();
    const sheet = doc.sheetsByTitle[SHEET_TITLE];

    if (!sheet) {
        throw new Error('Projects sheet not found');
    }

    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === id);

    if (!row) {
        throw new Error('Project not found');
    }

    row.set('progress', progress);

    // Auto-update status based on progress
    const progressNum = parseInt(progress);
    if (progressNum === 0) {
        row.set('status', 'Not Started');
    } else if (progressNum === 100) {
        row.set('status', 'Completed');
    } else {
        row.set('status', 'In Progress');
    }

    await row.save();

    // Log audit
    try {
        const { logAudit } = await import('./auditService');
        await logAudit(userId, 'UPDATE', id, `Progress updated to ${progress}%`);
    } catch (e) {
        console.error('Failed to log audit', e);
    }

    return {
        id: row.get('id'),
        name: row.get('name'),
        agency: row.get('agency'),
        budget: row.get('budget'),
        start_date: row.get('start_date'),
        end_date: row.get('end_date'),
        status: row.get('status'),
        progress: row.get('progress'),
        fiscal_year: row.get('fiscal_year'),
        target_group: row.get('target_group'),
        source: row.get('source'),
        last_updated: row.get('last_updated')
    } as Project;
}
