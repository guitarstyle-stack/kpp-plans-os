
import { PrismaClient } from '@prisma/client';
import { doc, connectToSheet } from '../src/lib/googleSheets';

const prisma = new PrismaClient();

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
        // await userSheet.loadHeaderRow(); // Already loaded by getRows internally usually, but explicitly is fine
        const userRows = await userSheet.getRows();
        console.log(`Found ${userRows.length} users to migrate.`);

        for (const row of userRows) {
            // Map headers: line_user_id, display_name, picture_url, role, status, last_login, first_name, last_name, position, department_id, phone, email, id
            const id = row.get('id');
            const username = row.get('email') || row.get('line_user_id') || row.get('display_name') || `user_${Math.random().toString(36).substr(2, 9)}`;
            const password = 'change_me_123';

            const rawDeptId = row.get('department_id'); // Sheet ID
            const deptId = rawDeptId ? deptMap.get(rawDeptId) : undefined; // Mapped DB ID

            const userData = {
                id: id || undefined,
                username: username,
                password: password,
                role: row.get('role') || 'user',
                departmentId: deptId // Uses Mapped ID
            };

            try {
                if (id) {
                    await prisma.user.upsert({
                        where: { id: id },
                        update: {
                            departmentId: deptId,
                            role: row.get('role') || 'user'
                        },
                        create: userData
                    });
                } else {
                    // Try to find by username
                    await prisma.user.upsert({
                        where: { username: username },
                        update: {
                            departmentId: deptId,
                            role: row.get('role') || 'user'
                        },
                        create: userData
                    });
                }
            } catch (e) {
                console.error(`Failed to migrate user ${username}:`, e);
            }
        }
        console.log('Users migrated.');
    }

    // 1. Migrate Projects
    const projectSheet = doc.sheetsByTitle['Projects'];
    if (!projectSheet) throw new Error('Projects sheet not found');

    const projectRows = await projectSheet.getRows();
    console.log(`Found ${projectRows.length} projects to migrate.`);

    for (const row of projectRows) {
        // Parse numeric values (remove commas, handle empty strings)
        const budget = row.get('budget') ? parseFloat(row.get('budget').replace(/,/g, '')) : 0;
        const budgetSpent = row.get('budget_spent') ? parseFloat(row.get('budget_spent').replace(/,/g, '')) : 0;
        const progress = row.get('progress') ? parseFloat(row.get('progress')) : 0;

        const id = row.get('id');
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
            responsiblePerson: row.get('responsible_person'),
            lastUpdated: row.get('last_updated') ? new Date(row.get('last_updated')) : new Date()
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

            // Check if project exists (orphaned indicators fix)
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

                // Upsert Indicator
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

    // 3. Migrate Reports (Optional: if Report sheet exists)
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
