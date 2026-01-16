import { PrismaClient } from '@prisma/client';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const prisma = new PrismaClient();

// Inlined from googleSheets.ts
const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID as string, serviceAccountAuth);

async function connectToSheet() {
    try {
        await doc.loadInfo();
        console.log(`Connected to sheet: ${doc.title}`);
        return doc;
    } catch (error) {
        console.error('Error connecting to Google Sheet:', error);
        throw error;
    }
}

async function main() {
    console.log('Start migration...');

    // Connect to Google Sheets
    await connectToSheet();

    // 0. Migrate Departments
    const deptSheet = doc.sheetsByTitle['Departments'];
    const deptMap = new Map<string, string>(); // Name -> ID

    if (deptSheet) {
        const deptRows = await deptSheet.getRows();
        console.log(`Found ${deptRows.length} departments to migrate.`);

        for (const row of deptRows) {
            const name = row.get('name');
            const code = row.get('code');
            const id = row.get('id');
            if (!name) continue;

            const deptData = {
                id: id || undefined,
                name,
                code: code || undefined
            };

            const existing = await prisma.department.findUnique({
                where: { name: name }
            });

            if (existing) {
                if (id) deptMap.set(id, existing.id); // Map Sheet ID -> DB ID
            } else {
                if (id) {
                    await prisma.department.create({ data: deptData });
                    deptMap.set(id, id);
                } else {
                    const newDept = await prisma.department.create({
                        data: { name, code: code || undefined }
                    });
                    if (id) deptMap.set(id, newDept.id);
                }
            }
        }
        console.log('Departments migrated.');
    }

    // 0.5 Migrate Users
    const userSheet = doc.sheetsByTitle['Users'];
    if (userSheet) {
        const userRows = await userSheet.getRows();
        console.log(`Found ${userRows.length} users to migrate.`);

        for (const row of userRows) {
            // FIX: Use existing ID or generate one if missing
            const id = row.get('id') || row.get('line_user_id') || `user_${Math.random().toString(36).substr(2, 9)}`;

            // Determine username based on available fields
            const username = row.get('line_user_id') || row.get('email') || `user_${Math.random().toString(36).substr(2, 9)}`;

            // Password fallback
            const password = 'change_me_123';

            const rawDeptId = row.get('department_id'); // Sheet ID
            const deptId = rawDeptId ? deptMap.get(rawDeptId) : undefined; // Mapped DB ID

            // New fields mapping
            const pictureUrl = row.get('picture_url');
            const displayName = row.get('display_name');
            const email = row.get('email');
            const firstName = row.get('first_name');
            const lastName = row.get('last_name');
            const phoneNumber = row.get('phone_number');

            const userData = {
                id: id,
                username: username,
                password: password,
                role: row.get('role') || 'user',
                departmentId: deptId,
                pictureUrl,
                displayName,
                email,
                firstName,
                lastName,
                phoneNumber
            };

            try {
                await prisma.user.upsert({
                    where: { username: username }, // Use username as unique key for upsert if ID is unstable
                    update: {
                        departmentId: deptId,
                        role: row.get('role') || 'user',
                        pictureUrl,
                        displayName,
                        email,
                        firstName,
                        lastName,
                        phoneNumber
                    },
                    create: userData
                });
            } catch (e) {
                console.error(`Failed to migrate user ${username}:`, e);
            }
        }
        console.log('Users migrated.');
    }

    // ... (Categories, Plans, Goals, Indicators logic remains same) ...

    // 0.6 Migrate Project Categories
    const catSheet = doc.sheetsByTitle['ProjectCategories'];
    if (catSheet) {
        const catRows = await catSheet.getRows();
        console.log(`Found ${catRows.length} categories to migrate.`);
        for (const row of catRows) {
            const id = row.get('id');
            if (!id) continue;

            const catData = {
                id: id,
                name: row.get('name') || 'Unnamed Category',
                description: row.get('description'),
                fiscalYear: row.get('fiscal_year')
            };

            await prisma.projectCategory.upsert({
                where: { id: id },
                update: catData,
                create: catData
            });
        }
        console.log('Project Categories migrated.');
    }

    // 0.7 Migrate Strategic Plans
    const planSheet = doc.sheetsByTitle['StrategicPlans'];
    if (planSheet) {
        const planRows = await planSheet.getRows();
        console.log(`Found ${planRows.length} strategic plans to migrate.`);
        for (const row of planRows) {
            const id = row.get('id');
            if (!id) continue;

            const planData = {
                id: id,
                name: row.get('name') || 'Unnamed Plan',
                fiscalYear: row.get('fiscal_year') || new Date().getFullYear().toString(),
                description: row.get('description')
            };

            await prisma.strategicPlan.upsert({
                where: { id: id },
                update: planData,
                create: planData
            });
        }
        console.log('Strategic Plans migrated.');
    }

    // 0.8 Migrate Strategic Goals
    const goalSheet = doc.sheetsByTitle['StrategicGoals'];
    if (goalSheet) {
        const goalRows = await goalSheet.getRows();
        console.log(`Found ${goalRows.length} strategic goals to migrate.`);
        for (const row of goalRows) {
            const id = row.get('id');
            const planId = row.get('planId');
            if (!id || !planId) continue;

            // Optional: verify planExists if needed, but upsert is safe usually
            const goalData = {
                id: id,
                planId: planId,
                name: row.get('name') || 'Unnamed Goal',
                description: row.get('description')
            };

            await prisma.strategicGoal.upsert({
                where: { id: id },
                update: goalData,
                create: goalData
            });
        }
        console.log('Strategic Goals migrated.');
    }

    // 0.9 Migrate Strategic Indicators
    const stratIndSheet = doc.sheetsByTitle['StrategicIndicators'];
    if (stratIndSheet) {
        const indRows = await stratIndSheet.getRows();
        console.log(`Found ${indRows.length} strategic indicators to migrate.`);
        for (const row of indRows) {
            const id = row.get('id');
            const goalId = row.get('goalId');
            if (!id || !goalId) continue;

            const indData = {
                id: id,
                goalId: goalId,
                name: row.get('name') || 'Unnamed Indicator',
                recommendedTarget: row.get('recommended_target'),
                unit: row.get('unit'),
                description: row.get('description')
            };

            await prisma.strategicIndicator.upsert({
                where: { id: id },
                update: indData,
                create: indData
            });
        }
        console.log('Strategic Indicators migrated.');
    }

    // 1. Migrate Projects
    const projectSheet = doc.sheetsByTitle['Projects'];
    if (!projectSheet) throw new Error('Projects sheet not found');

    const projectRows = await projectSheet.getRows();
    console.log(`Projects Sheet Headers: ${projectSheet.headerValues.join(', ')}`);
    console.log(`Found ${projectRows.length} projects to migrate.`);

    for (const row of projectRows) {
        const budget = row.get('budget') ? parseFloat(row.get('budget').replace(/,/g, '')) : 0;
        const budgetSpent = row.get('budget_spent') ? parseFloat(row.get('budget_spent').replace(/,/g, '')) : 0;
        const progress = row.get('progress') ? parseFloat(row.get('progress')) : 0;

        const id = row.get('id');

        let categoryId = row.get('categoryId');
        if (!categoryId && row.get('categoryId') !== '') categoryId = undefined;
        else if (categoryId === '') categoryId = null;

        let strategicPlanId = row.get('strategicPlanId');
        if (!strategicPlanId && row.get('strategicPlanId') !== '') strategicPlanId = undefined;
        else if (strategicPlanId === '') strategicPlanId = null;

        let strategicGoalId = row.get('strategicGoalId');
        if (!strategicGoalId && row.get('strategicGoalId') !== '') strategicGoalId = undefined;
        else if (strategicGoalId === '') strategicGoalId = null;

        // Verify foreign key existence
        let validCategoryId = null;
        if (categoryId) {
            const exists = await prisma.projectCategory.findUnique({ where: { id: categoryId } });
            if (exists) validCategoryId = categoryId;
        }

        let validStrategicPlanId = null;
        if (strategicPlanId) {
            const exists = await prisma.strategicPlan.findUnique({ where: { id: strategicPlanId } });
            if (exists) validStrategicPlanId = strategicPlanId;
        }

        let validStrategicGoalId = null;
        if (strategicGoalId) {
            const exists = await prisma.strategicGoal.findUnique({ where: { id: strategicGoalId } });
            if (exists) validStrategicGoalId = strategicGoalId;
        }

        const projectData = {
            id: id || undefined,
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
            targetGroupAmount: row.get('target_group_amount'),
            responsiblePerson: row.get('responsible_person'),
            lastUpdated: row.get('last_updated') ? new Date(row.get('last_updated')) : new Date(),
            categoryId: validCategoryId,
            developmentGuideline: row.get('development_guideline'),
            governanceIndicator: row.get('governance_indicator'),
            annualTarget: row.get('annual_target'),
            objective: row.get('objective'),
            supportAgency: row.get('support_agency'),
            strategicPlanId: validStrategicPlanId,
            strategicGoalId: validStrategicGoalId,
        };

        if (id) {
            await prisma.project.upsert({
                where: { id: id },
                update: projectData,
                create: projectData
            });
        } else {
            await prisma.project.create({ data: projectData });
        }
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

            const projectExists = await prisma.project.findUnique({ where: { id: projectId } });
            if (projectExists) {
                const indicatorData = {
                    id: row.get('id'),
                    name: row.get('name') || 'Unnamed Indicator',
                    target: row.get('target') || '',
                    unit: row.get('unit') || '',
                    result: row.get('result') || '',
                    projectId: projectId
                };

                if (indicatorData.id) {
                    await prisma.indicator.upsert({
                        where: { id: indicatorData.id },
                        update: indicatorData,
                        create: indicatorData
                    });
                } else {
                    await prisma.indicator.create({ data: indicatorData });
                }
            }
        }
        console.log('Indicators migrated.');
    }

    // 3. Migrate Reports
    const reportSheet = doc.sheetsByTitle['Reports'];
    if (reportSheet) {
        const reportRows = await reportSheet.getRows();
        console.log(`Found ${reportRows.length} reports to migrate.`);
        for (const row of reportRows) {
            const projectId = row.get('projectId');
            const projectExists = await prisma.project.findUnique({ where: { id: projectId } });
            if (!projectExists) continue;

            const reportData = {
                id: row.get('id'),
                projectId: projectId,
                progress: parseFloat(row.get('progress') || '0'),
                budgetSpent: parseFloat(row.get('budgetSpent') || '0'),
                performance: row.get('performance'),
                issues: row.get('issues'),
                activities: row.get('activities'),
                indicatorResults: row.get('indicatorResults'),
                submissionDate: row.get('submissionDate'),
                createdAt: row.get('timestamp') ? new Date(row.get('timestamp')) : new Date()
            };

            if (reportData.id) {
                await prisma.report.upsert({
                    where: { id: reportData.id },
                    update: reportData,
                    create: reportData
                });
            } else {
                await prisma.report.create({ data: reportData });
            }
        }
        console.log('Reports migrated.');
    }

    // 4. Migrate AuditLogs (New)
    const auditSheet = doc.sheetsByTitle['AuditLogs'];
    if (auditSheet) {
        const auditRows = await auditSheet.getRows();
        console.log(`Found ${auditRows.length} audit logs to migrate.`);
        for (const row of auditRows) {
            const id = row.get('id');
            const auditData = {
                id: id,
                timestamp: row.get('timestamp') ? new Date(row.get('timestamp')) : new Date(),
                actor: row.get('actor') || 'System',
                action: row.get('action') || 'Unknown',
                target: row.get('target') || 'Unknown',
                details: row.get('details'),
                ip: row.get('ip')
            };

            if (id) {
                await prisma.auditLog.upsert({
                    where: { id: id },
                    update: auditData,
                    create: auditData
                });
            } else {
                await prisma.auditLog.create({ data: auditData });
            }
        }
        console.log('AuditLogs migrated.');
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
