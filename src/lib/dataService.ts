
import { doc, connectToSheet } from './googleSheets';
import { Project, Indicator, ProjectReport, ProjectCategory, StrategicPlan, StrategicGoal, StrategicIndicator } from './types';
import { cache, CacheKeys } from './cache';

const SHEET_TITLES = {
    PROJECTS: 'Projects',
    INDICATORS: 'Indicators',
    REPORTS: 'Reports',
    CATEGORIES: 'ProjectCategories',
    STRATEGIC_PLANS: 'StrategicPlans',
    STRATEGIC_GOALS: 'StrategicGoals',
    STRATEGIC_INDICATORS: 'StrategicIndicators',
};

const SHEET_HEADERS = {
    [SHEET_TITLES.PROJECTS]: [
        'id', 'name', 'agency', 'target_group', 'budget', 'source', 'status',
        'progress', 'project_name', 'start_date', 'end_date', 'responsible_person',
        'description', 'last_updated', 'fiscal_year', 'budget_spent', 'performance', 'categoryId',
        'development_guideline', 'governance_indicator', 'annual_target', 'objective', 'support_agency',
        'strategicPlanId', 'strategicGoalId', 'target_group_amount'
    ],
    [SHEET_TITLES.INDICATORS]: ['id', 'projectId', 'name', 'target', 'unit', 'result'],
    [SHEET_TITLES.REPORTS]: [
        'id', 'projectId', 'userId', 'submissionDate', 'progress',
        'budgetSpent', 'performance', 'issues', 'activities', 'indicatorResults'
    ],
    [SHEET_TITLES.CATEGORIES]: ['id', 'name', 'description', 'fiscal_year'],
    [SHEET_TITLES.STRATEGIC_PLANS]: ['id', 'name', 'fiscal_year', 'description'],
    [SHEET_TITLES.STRATEGIC_GOALS]: ['id', 'planId', 'name', 'description'],
    [SHEET_TITLES.STRATEGIC_INDICATORS]: ['id', 'goalId', 'name', 'recommended_target', 'unit', 'description']
};

async function ensureSheet(title: string) {
    const sheet = doc.sheetsByTitle[title];
    const headers = SHEET_HEADERS[title];
    if (!sheet) {
        // Create new sheet
        if (headers) {
            await doc.addSheet({ title, headerValues: headers });
            console.log(`Created new sheet: ${title}`);
            // Reload doc info to make sure we have the latest sheets
            await doc.loadInfo();
            return doc.sheetsByTitle[title];
        }
        throw new Error(`No headers defined for unknown sheet title: ${title}`);
    }

    // Check cache for header validation status
    const cacheKey = CacheKeys.SHEET_HEADERS(title);
    const cached = cache.get<boolean>(cacheKey);

    if (!cached) {
        // Check if headers match and update if needed
        await sheet.loadHeaderRow();
        const currentHeaders = sheet.headerValues;
        const missingHeaders = headers.filter(h => !currentHeaders.includes(h));

        if (missingHeaders.length > 0) {
            console.log(`Updating headers for ${title}. Missing: ${missingHeaders.join(', ')}`);
            const newHeaders = [...currentHeaders, ...missingHeaders];
            await sheet.setHeaderRow(newHeaders);
            await sheet.loadHeaderRow();
        }

        // Cache that headers are validated (5 minute TTL)
        cache.set(cacheKey, true, 5 * 60 * 1000);
    }

    return sheet;
}

export async function getProjects(): Promise<Project[]> {
    // Check cache first
    const cached = cache.get<Project[]>(CacheKeys.PROJECTS);
    if (cached) {
        return cached;
    }

    await connectToSheet();
    try {
        const sheet = await ensureSheet(SHEET_TITLES.PROJECTS);
        const rows = await sheet.getRows();
        const projects = rows.map((row) => ({
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
            budget_spent: parseFloat(row.get('budget_spent') || '0'),
            performance: row.get('performance'),

            categoryId: row.get('categoryId'),
            development_guideline: row.get('development_guideline'),
            governance_indicator: row.get('governance_indicator'),
            annual_target: row.get('annual_target'),
            objective: row.get('objective'),
            support_agency: row.get('support_agency'),
            strategicPlanId: row.get('strategicPlanId'),
            strategicGoalId: row.get('strategicGoalId'),
            target_group_amount: row.get('target_group_amount'),
            _rowIndex: (row as unknown as { rowIndex: number }).rowIndex,
        }));

        // Cache results for 1 minute
        cache.set(CacheKeys.PROJECTS, projects);
        return projects;
    } catch (error) {
        console.error("Error in getProjects:", error);
        return [];
    }
}

export async function getProjectCategories(): Promise<ProjectCategory[]> {
    await connectToSheet();
    const sheet = await ensureSheet(SHEET_TITLES.CATEGORIES);

    const rows = await sheet.getRows();
    return rows.map((row) => ({
        id: row.get('id'),
        name: row.get('name'),
        description: row.get('description'),
        fiscal_year: row.get('fiscal_year'),
        _rowIndex: (row as unknown as { rowIndex: number }).rowIndex,
    }));
}

export async function addProjectCategory(category: Omit<ProjectCategory, '_rowIndex'>) {
    try {
        await connectToSheet();
        const sheet = await ensureSheet(SHEET_TITLES.CATEGORIES);

        // Debug logging
        console.log(`Adding category. Current Headers: ${sheet.headerValues.join(', ')}`);

        const newRow = await sheet.addRow({
            id: category.id,
            name: category.name,
            description: category.description || '',
            fiscal_year: category.fiscal_year || '',
        });

        // Return a plain object to avoid circular reference issues when serializing
        return {
            id: newRow.get('id'),
            name: newRow.get('name'),
            description: newRow.get('description'),
            fiscal_year: newRow.get('fiscal_year'),
        };
    } catch (error) {
        console.error("Error in addProjectCategory:", error);
        throw error;
    } finally {
        // Invalidate categories cache after adding
        cache.invalidate(CacheKeys.CATEGORIES);
    }
}

export async function updateProjectCategory(category: Partial<ProjectCategory>) {
    await connectToSheet();
    const sheet = await ensureSheet(SHEET_TITLES.CATEGORIES);

    const rows = await sheet.getRows();
    try {
        await connectToSheet();
        const sheet = await ensureSheet(SHEET_TITLES.CATEGORIES);

        const rows = await sheet.getRows();
        const row = rows.find((r) => r.get('id') === category.id);

        if (row) {
            row.assign({
                name: category.name || row.get('name'),
                description: category.description || row.get('description'),
                fiscal_year: category.fiscal_year !== undefined ? category.fiscal_year : (row.get('fiscal_year') || ''),
            });
            await row.save();

            // Return plain object
            return {
                id: row.get('id'),
                name: row.get('name'),
                description: row.get('description'),
                fiscal_year: row.get('fiscal_year'),
            };
        }
        throw new Error('Category not found');
    } catch (error) {
        console.error("Error in updateProjectCategory:", error);
        throw error;
    }
}

export async function deleteProjectCategory(id: string) {
    await connectToSheet();
    const sheet = await ensureSheet(SHEET_TITLES.CATEGORIES);

    const rows = await sheet.getRows();
    const row = rows.find((r) => r.get('id') === id);

    if (row) {
        await row.delete();
        return { success: true };
    }
    throw new Error('Category not found');
}

export async function addProject(project: Omit<Project, '_rowIndex'>) {
    await connectToSheet();
    const sheet = await ensureSheet(SHEET_TITLES.PROJECTS);

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
        budget_spent: (project.budget_spent || 0).toString(),
        categoryId: project.categoryId || '',
        development_guideline: project.development_guideline || '',
        governance_indicator: project.governance_indicator || '',
        annual_target: project.annual_target || '',
        objective: project.objective || '',
        support_agency: project.support_agency || '',
        strategicPlanId: project.strategicPlanId || '',
        strategicGoalId: project.strategicGoalId || '',
        target_group_amount: project.target_group_amount || '',
    });

    // Invalidate projects cache after adding
    cache.invalidate(CacheKeys.PROJECTS);
    return newRow;
}

export async function updateProject(project: Partial<Project>) {
    await connectToSheet();
    const sheet = await ensureSheet(SHEET_TITLES.PROJECTS);

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
            budget_spent: (project.budget_spent !== undefined ? project.budget_spent : (row.get('budget_spent') || 0)).toString(),
            categoryId: project.categoryId || row.get('categoryId') || '',
            development_guideline: project.development_guideline || row.get('development_guideline') || '',
            governance_indicator: project.governance_indicator || row.get('governance_indicator') || '',
            annual_target: project.annual_target || row.get('annual_target') || '',
            objective: project.objective || row.get('objective') || '',
            support_agency: project.support_agency || row.get('support_agency') || '',
            strategicPlanId: project.strategicPlanId || row.get('strategicPlanId') || '',
            strategicGoalId: project.strategicGoalId || row.get('strategicGoalId') || '',
            target_group_amount: project.target_group_amount || row.get('target_group_amount') || '',
        });
        await row.save();

        // Invalidate projects cache after updating
        cache.invalidate(CacheKeys.PROJECTS);
        return row;
    }
    throw new Error('Project not found');
}

export async function deleteProject(id: string) {
    await connectToSheet();
    const sheet = await ensureSheet(SHEET_TITLES.PROJECTS);

    const rows = await sheet.getRows();
    const row = rows.find((r) => r.get('id') === id);

    if (row) {
        await row.delete();

        // Invalidate projects cache after deleting  
        cache.invalidate(CacheKeys.PROJECTS);
        return { success: true };
    }
    throw new Error('Project not found');
}

export async function getIndicators(projectId: string): Promise<Indicator[]> {
    await connectToSheet();
    const sheet = await ensureSheet(SHEET_TITLES.INDICATORS);

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
    const sheet = await ensureSheet(SHEET_TITLES.INDICATORS);

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
    const reportsSheet = await ensureSheet(SHEET_TITLES.REPORTS);

    const newReportRow = await reportsSheet.addRow({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        projectId: reportData.projectId,
        userId: reportData.userId,
        submissionDate: reportData.submissionDate,
        progress: reportData.progress.toString(),
        budgetSpent: reportData.budgetSpent.toString(),
        performance: reportData.performance,
        issues: reportData.issues,
        activities: reportData.activities || '',
        indicatorResults: JSON.stringify(reportData.indicatorResults)
    });

    // 2. Update Project Progress & Budget Spent
    const projectsSheet = await ensureSheet(SHEET_TITLES.PROJECTS);
    const projectRows = await projectsSheet.getRows();
    const projectRow = projectRows.find(r => r.get('id') === reportData.projectId);

    if (projectRow) {
        const totalBudget = parseFloat(projectRow.get('budget') || '0');
        const currentSpent = parseFloat(projectRow.get('budget_spent') || '0');
        const newSpent = currentSpent + parseFloat(reportData.budgetSpent.toString());

        let newProgress = 0;
        if (totalBudget > 0) {
            newProgress = (newSpent / totalBudget) * 100;
            if (newProgress > 100) newProgress = 100;
        }

        projectRow.assign({
            progress: newProgress.toFixed(2),
            budget_spent: newSpent.toString(),
            last_updated: new Date().toISOString(),
            status: newProgress === 100 ? 'ดำเนินการแล้วเสร็จ' : (newProgress > 0 ? 'กำลังดำเนินการ' : 'ยังไม่ดำเนินการ'),
            performance: reportData.performance
        });
        await projectRow.save();
    }

    // 3. Update Indicators (Latest Result)
    const indicatorsSheet = await ensureSheet(SHEET_TITLES.INDICATORS);
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
    const sheet = await ensureSheet(SHEET_TITLES.REPORTS);
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
        activities: row.get('activities'),
        indicatorResults: JSON.parse(row.get('indicatorResults') || '{}'),
        _rowIndex: (row as unknown as { rowIndex: number }).rowIndex,
    }));
}

export async function deleteReportsByProjectId(projectId: string): Promise<void> {
    await connectToSheet();
    const sheet = await ensureSheet(SHEET_TITLES.REPORTS);
    if (!sheet) return;

    const rows = await sheet.getRows();
    const projectRows = rows.filter(row => row.get('projectId') === projectId);

    // Delete in reverse order to avoid index shifting issues (standard practice for sheet deletion loops)
    for (let i = projectRows.length - 1; i >= 0; i--) {
        await projectRows[i].delete();
    }

    console.log(`Deleted ${projectRows.length} reports for project ${projectId}`);
}

// --- Strategic Plans CRUD ---

export async function getStrategicPlans(fiscalYear?: string): Promise<StrategicPlan[]> {
    await connectToSheet();
    const sheet = await ensureSheet(SHEET_TITLES.STRATEGIC_PLANS);
    const rows = await sheet.getRows();

    let plans = rows.map((row) => ({
        id: row.get('id'),
        name: row.get('name'),
        fiscal_year: row.get('fiscal_year'),
        description: row.get('description'),
        _rowIndex: (row as unknown as { rowIndex: number }).rowIndex,
    }));

    if (fiscalYear) {
        plans = plans.filter(p => p.fiscal_year === fiscalYear);
    }
    return plans;
}

export async function addStrategicPlan(plan: Omit<StrategicPlan, '_rowIndex'>) {
    await connectToSheet();
    const sheet = await ensureSheet(SHEET_TITLES.STRATEGIC_PLANS);
    const newRow = await sheet.addRow({
        id: plan.id,
        name: plan.name,
        fiscal_year: plan.fiscal_year,
        description: plan.description || '',
    });
    return {
        id: newRow.get('id'),
        name: newRow.get('name'),
        fiscal_year: newRow.get('fiscal_year'),
        description: newRow.get('description'),
    };
}

export async function updateStrategicPlan(plan: Partial<StrategicPlan>) {
    await connectToSheet();
    const sheet = await ensureSheet(SHEET_TITLES.STRATEGIC_PLANS);
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === plan.id);

    if (row) {
        row.assign({
            name: plan.name || row.get('name'),
            fiscal_year: plan.fiscal_year || row.get('fiscal_year'),
            description: plan.description || row.get('description'),
        });
        await row.save();
        return {
            id: row.get('id'),
            name: row.get('name'),
            fiscal_year: row.get('fiscal_year'),
            description: row.get('description'),
        };
    }
    throw new Error('Strategic Plan not found');
}

export async function deleteStrategicPlan(id: string) {
    await connectToSheet();
    const sheet = await ensureSheet(SHEET_TITLES.STRATEGIC_PLANS);
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === id);

    if (row) {
        await row.delete();
        return { success: true };
    }
    throw new Error('Strategic Plan not found');
}

// --- Strategic Goals CRUD ---

export async function getStrategicGoals(planId: string): Promise<StrategicGoal[]> {
    await connectToSheet();
    const sheet = await ensureSheet(SHEET_TITLES.STRATEGIC_GOALS);
    const rows = await sheet.getRows();

    return rows
        .map((row) => ({
            id: row.get('id'),
            planId: row.get('planId'),
            name: row.get('name'),
            description: row.get('description'),
            _rowIndex: (row as unknown as { rowIndex: number }).rowIndex,
        }))
        .filter(g => g.planId === planId);
}

export async function addStrategicGoal(goal: Omit<StrategicGoal, '_rowIndex'>) {
    await connectToSheet();
    const sheet = await ensureSheet(SHEET_TITLES.STRATEGIC_GOALS);
    const newRow = await sheet.addRow({
        id: goal.id,
        planId: goal.planId,
        name: goal.name,
        description: goal.description || '',
    });
    return {
        id: newRow.get('id'),
        planId: newRow.get('planId'),
        name: newRow.get('name'),
        description: newRow.get('description'),
    };
}

export async function updateStrategicGoal(goal: Partial<StrategicGoal>) {
    await connectToSheet();
    const sheet = await ensureSheet(SHEET_TITLES.STRATEGIC_GOALS);
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === goal.id);

    if (row) {
        row.assign({
            name: goal.name || row.get('name'),
            description: goal.description || row.get('description'),
        });
        await row.save();
        return {
            id: row.get('id'),
            planId: row.get('planId'),
            name: row.get('name'),
            description: row.get('description'),
        };
    }
    throw new Error('Strategic Goal not found');
}

export async function deleteStrategicGoal(id: string) {
    await connectToSheet();
    const sheet = await ensureSheet(SHEET_TITLES.STRATEGIC_GOALS);
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === id);

    if (row) {
        await row.delete();
        return { success: true };
    }
    throw new Error('Strategic Goal not found');
}

// --- Strategic Indicators CRUD ---

export async function getStrategicIndicators(goalId: string): Promise<StrategicIndicator[]> {
    await connectToSheet();
    const sheet = await ensureSheet(SHEET_TITLES.STRATEGIC_INDICATORS);
    const rows = await sheet.getRows();

    return rows
        .map((row) => ({
            id: row.get('id'),
            goalId: row.get('goalId'),
            name: row.get('name'),
            recommended_target: row.get('recommended_target'),
            unit: row.get('unit'),
            description: row.get('description'),
            _rowIndex: (row as unknown as { rowIndex: number }).rowIndex,
        }))
        .filter(i => i.goalId === goalId);
}

export async function addStrategicIndicator(indicator: Omit<StrategicIndicator, '_rowIndex'>) {
    await connectToSheet();
    const sheet = await ensureSheet(SHEET_TITLES.STRATEGIC_INDICATORS);
    const newRow = await sheet.addRow({
        id: indicator.id,
        goalId: indicator.goalId,
        name: indicator.name,
        recommended_target: indicator.recommended_target || '',
        unit: indicator.unit || '',
        description: indicator.description || '',
    });
    return {
        id: newRow.get('id'),
        goalId: newRow.get('goalId'),
        name: newRow.get('name'),
        recommended_target: newRow.get('recommended_target'),
        unit: newRow.get('unit'),
        description: newRow.get('description'),
    };
}

export async function updateStrategicIndicator(indicator: Partial<StrategicIndicator>) {
    await connectToSheet();
    const sheet = await ensureSheet(SHEET_TITLES.STRATEGIC_INDICATORS);
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === indicator.id);

    if (row) {
        row.assign({
            name: indicator.name || row.get('name'),
            recommended_target: indicator.recommended_target !== undefined ? indicator.recommended_target : (row.get('recommended_target') || ''),
            unit: indicator.unit !== undefined ? indicator.unit : (row.get('unit') || ''),
            description: indicator.description || row.get('description'),
        });
        await row.save();
        return {
            id: row.get('id'),
            goalId: row.get('goalId'),
            name: row.get('name'),
            recommended_target: row.get('recommended_target'),
            unit: row.get('unit'),
            description: row.get('description'),
        };
    }
    throw new Error('Strategic Indicator not found');
}

export async function deleteStrategicIndicator(id: string) {
    await connectToSheet();
    const sheet = await ensureSheet(SHEET_TITLES.STRATEGIC_INDICATORS);
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === id);

    if (row) {
        await row.delete();
        return { success: true };
    }
    throw new Error('Strategic Indicator not found');
}
