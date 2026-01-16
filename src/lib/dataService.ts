
import { prisma } from '@/lib/prisma';
import { Project, Indicator, ProjectReport, ProjectCategory, StrategicPlan, StrategicGoal, StrategicIndicator, ProjectsResponse } from './types';


// Helper to convert Prisma Decimal to number/string as expected by frontend types
function toString(val: unknown): string {
    return val?.toString() || '';
}

function toNumber(val: unknown): number {
    return Number(val) || 0;
}

// EnsureSheet logic is no longer needed for Prisma

export async function getProjects(page = 1, limit = 100): Promise<ProjectsResponse> {
    // Check cache first (cache key needs to include pagination)
    // Removed cache for real-time requirement


    try {
        const skip = (page - 1) * limit;
        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' } // Ensure consistent ordering
            }),
            prisma.project.count()
        ]);

        const mappedProjects: Project[] = projects.map(p => ({
            id: p.id,
            name: p.name,
            agency: p.agency,
            target_group: p.targetGroup || '',
            budget: toString(p.budget),
            source: p.source || '',
            status: p.status,
            progress: toString(p.progress),
            project_name: p.projectName || '',
            start_date: p.startDate,
            end_date: p.endDate,
            responsible_person: p.responsiblePerson || '',
            description: p.description || '',
            last_updated: p.lastUpdated.toISOString(),
            fiscal_year: p.fiscalYear,
            budget_spent: toNumber(p.budgetSpent),
            performance: '',
            categoryId: p.categoryId || '',
            development_guideline: p.developmentGuideline || '',
            governance_indicator: p.governanceIndicator || '',
            annual_target: p.annualTarget || '',
            objective: p.objective || '',
            support_agency: p.supportAgency || '',
            strategicPlanId: p.strategicPlanId || '',
            strategicGoalId: p.strategicGoalId || '',
            target_group_amount: p.targetGroupAmount || '',
        }));

        const response: ProjectsResponse = {
            data: mappedProjects,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };

        // Cache results for 1 minute
        // cache.set(cacheKey, response);

        return response;
    } catch (error) {
        console.error("Error in getProjects:", error);
        return {
            data: [],
            total: 0,
            page: 1,
            limit: 100,
            totalPages: 0
        };
    }
}

export async function getProjectCategories(): Promise<ProjectCategory[]> {
    const categories = await prisma.projectCategory.findMany();
    return categories.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        fiscal_year: c.fiscalYear || '',
    }));
}

export async function addProjectCategory(category: Omit<ProjectCategory, '_rowIndex'>) {
    try {
        const newCategory = await prisma.projectCategory.create({
            data: {
                id: category.id || undefined,
                name: category.name,
                description: category.description,
                fiscalYear: category.fiscal_year,
            }
        });



        return {
            id: newCategory.id,
            name: newCategory.name,
            description: newCategory.description || '',
            fiscal_year: newCategory.fiscalYear || '',
        };
    } catch (error) {
        console.error("Error in addProjectCategory:", error);
        throw error;
    }
}

export async function updateProjectCategory(category: Partial<ProjectCategory>) {
    if (!category.id) throw new Error('Category ID required');

    try {
        const updated = await prisma.projectCategory.update({
            where: { id: category.id },
            data: {
                name: category.name,
                description: category.description,
                fiscalYear: category.fiscal_year,
            }
        });

        return {
            id: updated.id,
            name: updated.name,
            description: updated.description || '',
            fiscal_year: updated.fiscalYear || '',
        };
    } catch (error) {
        console.error("Error in updateProjectCategory:", error);
        throw error;
    }
}

export async function deleteProjectCategory(id: string) {
    try {
        await prisma.projectCategory.delete({ where: { id } });
        return { success: true };
    } catch (e) {
        throw new Error('Category not found');
    }
}

export async function addProject(project: Omit<Project, '_rowIndex'>) {
    const newProject = await prisma.project.create({
        data: {
            id: project.id || undefined,
            name: project.name,
            agency: project.agency,
            targetGroup: project.target_group,
            budget: String(project.budget || 0), // Prisma handles string to Decimal
            source: project.source,
            status: project.status || 'Not Started',
            progress: Number(project.progress || 0),
            projectName: project.project_name,
            startDate: project.start_date,
            endDate: project.end_date,
            responsiblePerson: project.responsible_person,
            description: project.description,
            // performance: project.performance, // Missed in schema
            lastUpdated: new Date(),
            fiscalYear: project.fiscal_year,
            budgetSpent: Number(project.budget_spent || 0),

            categoryId: project.categoryId,
            developmentGuideline: project.development_guideline,
            governanceIndicator: project.governance_indicator,
            annualTarget: project.annual_target,
            objective: project.objective,
            supportAgency: project.support_agency,
            strategicPlanId: project.strategicPlanId,
            strategicGoalId: project.strategicGoalId,
            targetGroupAmount: project.target_group_amount,
        }
    });


    return newProject;
}

export async function updateProject(project: Partial<Project>) {
    if (!project.id) throw new Error('Project ID required');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
        lastUpdated: new Date(),
    };

    if (project.name !== undefined) updateData.name = project.name;
    if (project.agency !== undefined) updateData.agency = project.agency;
    if (project.target_group !== undefined) updateData.targetGroup = project.target_group;
    if (project.budget !== undefined) updateData.budget = String(project.budget);
    if (project.source !== undefined) updateData.source = project.source;
    if (project.status !== undefined) updateData.status = project.status;
    if (project.progress !== undefined) updateData.progress = Number(project.progress);
    if (project.project_name !== undefined) updateData.projectName = project.project_name;
    if (project.start_date !== undefined) updateData.startDate = project.start_date;
    if (project.end_date !== undefined) updateData.endDate = project.end_date;
    if (project.responsible_person !== undefined) updateData.responsiblePerson = project.responsible_person;
    if (project.description !== undefined) updateData.description = project.description;
    if (project.fiscal_year !== undefined) updateData.fiscalYear = project.fiscal_year;
    if (project.budget_spent !== undefined) updateData.budgetSpent = Number(project.budget_spent);

    if (project.categoryId !== undefined) updateData.categoryId = project.categoryId;
    if (project.development_guideline !== undefined) updateData.developmentGuideline = project.development_guideline;
    if (project.governance_indicator !== undefined) updateData.governanceIndicator = project.governance_indicator;
    if (project.annual_target !== undefined) updateData.annualTarget = project.annual_target;
    if (project.objective !== undefined) updateData.objective = project.objective;
    if (project.support_agency !== undefined) updateData.supportAgency = project.support_agency;
    if (project.strategicPlanId !== undefined) updateData.strategicPlanId = project.strategicPlanId;
    if (project.strategicGoalId !== undefined) updateData.strategicGoalId = project.strategicGoalId;
    if (project.target_group_amount !== undefined) updateData.targetGroupAmount = project.target_group_amount;

    const updated = await prisma.project.update({
        where: { id: project.id },
        data: updateData
    });


    return updated; // Caller might expect different shape, but usually just needs ID or success
}

export async function deleteProject(id: string) {
    try {
        await prisma.project.delete({ where: { id } });

        return { success: true };
    } catch (e) {
        throw new Error('Project not found');
    }
}

export async function getIndicators(projectId: string): Promise<Indicator[]> {
    const indicators = await prisma.indicator.findMany({
        where: { projectId: projectId }
    });

    return indicators.map(i => ({
        id: i.id,
        projectId: i.projectId,
        name: i.name,
        target: i.target,
        unit: i.unit,
        result: i.result || '',
    }));
}

export async function updateIndicators(projectId: string, indicators: Omit<Indicator, '_rowIndex'>[]) {
    // Transactional replacement/update is hard with many-many, but simple 
    // strategy: delete all not in list, update existing, create new.
    // Or just upsert everything.

    // Simplest approach matching Sheets logic:
    // 1. Get existing
    const existing = await prisma.indicator.findMany({ where: { projectId } });
    const existingIds = new Set(existing.map(e => e.id));
    const incomingIds = new Set(indicators.filter(i => i.id).map(i => i.id));

    // 2. Delete missing
    const toDelete = existing.filter(e => !incomingIds.has(e.id)).map(e => e.id);
    if (toDelete.length > 0) {
        await prisma.indicator.deleteMany({ where: { id: { in: toDelete } } });
    }

    // 3. Upsert
    for (const ind of indicators) {
        if (ind.id && existingIds.has(ind.id)) {
            await prisma.indicator.update({
                where: { id: ind.id },
                data: {
                    name: ind.name,
                    target: ind.target,
                    unit: ind.unit,
                    result: ind.result
                }
            });
        } else {
            await prisma.indicator.create({
                data: {
                    id: ind.id || undefined,
                    projectId: projectId,
                    name: ind.name,
                    target: ind.target,
                    unit: ind.unit,
                    result: ind.result || ''
                }
            });
        }
    }
}

export async function addReport(reportData: Omit<ProjectReport, 'id' | '_rowIndex'>) {
    // 1. Create Report
    const report = await prisma.report.create({
        data: {
            projectId: reportData.projectId,
            userId: reportData.userId,
            submissionDate: reportData.submissionDate,
            progress: reportData.progress,
            budgetSpent: reportData.budgetSpent,
            performance: reportData.performance,
            issues: reportData.issues,
            activities: reportData.activities,
            indicatorResults: JSON.stringify(reportData.indicatorResults)
        }
    });

    // 2. Update Project (Total progress logic)
    // Similar logic to Sheets: get project, add budget spent to cumulative, recalc progress
    const project = await prisma.project.findUnique({ where: { id: reportData.projectId } });
    if (project) {
        const totalBudget = Number(project.budget);
        const currentSpent = Number(project.budgetSpent);
        const newSpent = currentSpent + reportData.budgetSpent;

        let newProgress = 0;
        if (totalBudget > 0) {
            newProgress = (newSpent / totalBudget) * 100;
            if (newProgress > 100) newProgress = 100;
        }

        const newStatus = newProgress === 100 ? 'ดำเนินการแล้วเสร็จ' : (newProgress > 0 ? 'กำลังดำเนินการ' : 'ยังไม่ดำเนินการ');

        await prisma.project.update({
            where: { id: project.id },
            data: {
                progress: newProgress,
                budgetSpent: newSpent,
                lastUpdated: new Date(),
                status: newStatus,
                // performance: reportData.performance // Missing field in schema
            }
        });
    }

    // 3. Update Indicators
    // Assuming keys in indicatorResults are Indicator IDs
    for (const [indId, result] of Object.entries(reportData.indicatorResults)) {
        // Optimization: could bundle updates
        try {
            await prisma.indicator.update({
                where: { id: indId },
                data: { result: String(result) }
            });
        } catch (e) {
            console.warn('Failed to update indicator result', indId);
        }
    }

    return report;
}

export async function getReportsByProject(projectId: string): Promise<ProjectReport[]> {
    const reports = await prisma.report.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' }
    });

    return reports.map(r => ({
        id: r.id,
        projectId: r.projectId,
        userId: r.userId || '',
        submissionDate: r.submissionDate || '',
        progress: Number(r.progress),
        budgetSpent: Number(r.budgetSpent),
        performance: r.performance || '',
        issues: r.issues || '',
        activities: r.activities || '',
        indicatorResults: JSON.parse(r.indicatorResults || '{}'),
    }));
}

export async function deleteReportsByProjectId(projectId: string): Promise<void> {
    await prisma.report.deleteMany({ where: { projectId } });
}

// --- Strategic Plans ---

export async function getStrategicPlans(fiscalYear?: string): Promise<StrategicPlan[]> {
    const where = fiscalYear ? { fiscalYear } : {};
    const plans = await prisma.strategicPlan.findMany({ where });
    return plans.map(p => ({
        id: p.id,
        name: p.name,
        fiscal_year: p.fiscalYear,
        description: p.description || '',
    }));
}

export async function addStrategicPlan(plan: Omit<StrategicPlan, '_rowIndex'>) {
    const newPlan = await prisma.strategicPlan.create({
        data: {
            id: plan.id || undefined,
            name: plan.name,
            fiscalYear: plan.fiscal_year,
            description: plan.description
        }
    });
    return {
        id: newPlan.id,
        name: newPlan.name,
        fiscal_year: newPlan.fiscalYear,
        description: newPlan.description || '',
    };
}

export async function updateStrategicPlan(plan: Partial<StrategicPlan>) {
    if (!plan.id) throw new Error('ID required');
    const updated = await prisma.strategicPlan.update({
        where: { id: plan.id },
        data: {
            name: plan.name,
            fiscalYear: plan.fiscal_year,
            description: plan.description
        }
    });
    return {
        id: updated.id,
        name: updated.name,
        fiscal_year: updated.fiscalYear,
        description: updated.description || '',
    };
}

export async function deleteStrategicPlan(id: string) {
    await prisma.strategicPlan.delete({ where: { id } });
    return { success: true };
}

// --- Strategic Goals ---

export async function getStrategicGoals(planId: string): Promise<StrategicGoal[]> {
    const goals = await prisma.strategicGoal.findMany({ where: { planId } });
    return goals.map(g => ({
        id: g.id,
        planId: g.planId,
        name: g.name,
        description: g.description || ''
    }));
}

export async function addStrategicGoal(goal: Omit<StrategicGoal, '_rowIndex'>) {
    const newGoal = await prisma.strategicGoal.create({
        data: {
            id: goal.id || undefined,
            planId: goal.planId,
            name: goal.name,
            description: goal.description
        }
    });
    return {
        id: newGoal.id,
        planId: newGoal.planId,
        name: newGoal.name,
        description: newGoal.description || ''
    };
}

export async function updateStrategicGoal(goal: Partial<StrategicGoal>) {
    if (!goal.id) throw new Error("ID required");
    const updated = await prisma.strategicGoal.update({
        where: { id: goal.id },
        data: {
            name: goal.name,
            description: goal.description
        }
    });
    return {
        id: updated.id,
        planId: updated.planId,
        name: updated.name,
        description: updated.description || ''
    };
}

export async function deleteStrategicGoal(id: string) {
    await prisma.strategicGoal.delete({ where: { id } });
    return { success: true };
}

// --- Strategic Indicators ---

export async function getStrategicIndicators(goalId: string): Promise<StrategicIndicator[]> {
    const inds = await prisma.strategicIndicator.findMany({ where: { goalId } });
    return inds.map(i => ({
        id: i.id,
        goalId: i.goalId,
        name: i.name,
        recommended_target: i.recommendedTarget || '',
        unit: i.unit || '',
        description: i.description || ''
    }));
}

export async function addStrategicIndicator(indicator: Omit<StrategicIndicator, '_rowIndex'>) {
    const newInd = await prisma.strategicIndicator.create({
        data: {
            id: indicator.id || undefined,
            goalId: indicator.goalId,
            name: indicator.name,
            recommendedTarget: indicator.recommended_target,
            unit: indicator.unit,
            description: indicator.description
        }
    });
    return {
        id: newInd.id,
        goalId: newInd.goalId,
        name: newInd.name,
        recommended_target: newInd.recommendedTarget || '',
        unit: newInd.unit || '',
        description: newInd.description || ''
    };
}

export async function updateStrategicIndicator(indicator: Partial<StrategicIndicator>) {
    if (!indicator.id) throw new Error('ID required');
    const updated = await prisma.strategicIndicator.update({
        where: { id: indicator.id },
        data: {
            name: indicator.name,
            recommendedTarget: indicator.recommended_target,
            unit: indicator.unit,
            description: indicator.description
        }
    });
    return {
        id: updated.id,
        goalId: updated.goalId,
        name: updated.name,
        recommended_target: updated.recommendedTarget || '',
        unit: updated.unit || '',
        description: updated.description || ''
    };
}

export async function deleteStrategicIndicator(id: string) {
    await prisma.strategicIndicator.delete({ where: { id } });
    return { success: true };
}

// Bulk update agency name for all lists (Cascade Update)
export async function updateProjectAgency(oldAgencyName: string, newAgencyName: string): Promise<void> {
    try {
        const result = await prisma.project.updateMany({
            where: { agency: oldAgencyName },
            data: {
                agency: newAgencyName,
                lastUpdated: new Date()
            }
        });

        console.log(`Updated ${result.count} projects from "${oldAgencyName}" to "${newAgencyName}"`);


        const { logAudit } = await import('./auditService');
        await logAudit('SYSTEM', 'UPDATE', 'BATCH', `Updated agency from ${oldAgencyName} to ${newAgencyName} for ${result.count} projects`);
    } catch (e) {
        console.error('Failed to batch update agency:', e);
    }
}

// Update project progress (for users)
export async function updateProjectProgress(id: string, progress: string, userId: string): Promise<Project | null> {
    try {
        const progressNum = parseFloat(progress);
        let status = 'กำลังดำเนินการ';
        if (progressNum <= 0) {
            status = 'ยังไม่ดำเนินการ';
        } else if (progressNum >= 100) {
            status = 'ดำเนินการแล้วเสร็จ';
        }

        const updated = await prisma.project.update({
            where: { id },
            data: {
                progress: progressNum,
                status: status,
                lastUpdated: new Date()
            }
        });



        const { logAudit } = await import('./auditService');
        await logAudit(userId, 'UPDATE', id, `Progress updated to ${progress}%`);

        // Return mapped project - reusing getProjects logic or simple mapping?
        // For simplicity and performance, simple mapping or return existing.
        // Reuse getProjects logic might be overkill but cleaner types. 
        // Let's do simple mapping matching the type expected.
        return {
            id: updated.id,
            name: updated.name,
            agency: updated.agency,
            target_group: updated.targetGroup || '',
            budget: String(updated.budget),
            source: updated.source || '',
            status: updated.status,
            progress: String(updated.progress),
            project_name: updated.projectName || '',
            start_date: updated.startDate,
            end_date: updated.endDate,
            responsible_person: updated.responsiblePerson || '',
            description: updated.description || '',
            last_updated: updated.lastUpdated.toISOString(),
            fiscal_year: updated.fiscalYear,
            budget_spent: Number(updated.budgetSpent),
            performance: '',
            categoryId: updated.categoryId || '',
            development_guideline: updated.developmentGuideline || '',
            governance_indicator: updated.governanceIndicator || '',
            annual_target: updated.annualTarget || '',
            objective: updated.objective || '',
            support_agency: updated.supportAgency || '',
            strategicPlanId: updated.strategicPlanId || '',
            strategicGoalId: updated.strategicGoalId || '',
            target_group_amount: updated.targetGroupAmount || '',
        };

    } catch (e) {
        console.error('Failed to update project progress:', e);
        throw e;
    }
}
