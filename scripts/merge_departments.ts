
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

// Load Env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envConfig: Record<string, string> = {};
envContent.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key) envConfig[key.trim()] = valueParts.join('=').trim().replace(/^"|"$/g, '');
});

const auth = new JWT({
    email: envConfig.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: envConfig.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function main() {
    console.log('Starting Department Merge...');
    const doc = new GoogleSpreadsheet(envConfig.GOOGLE_SHEET_ID, auth);
    await doc.loadInfo();

    const deptsSheet = doc.sheetsByTitle['Departments'];
    const projectsSheet = doc.sheetsByTitle['Projects'];
    const usersSheet = doc.sheetsByTitle['Users'];

    if (!deptsSheet || !projectsSheet) {
        console.error('Missing Departments or Projects sheet.');
        return;
    }

    // 1. Load All Data
    console.log('Loading data...');
    const [deptRows, projectRows, userRows] = await Promise.all([
        deptsSheet.getRows(),
        projectsSheet.getRows(),
        usersSheet ? usersSheet.getRows() : Promise.resolve([])
    ]);

    // 2. Count Usage to decide Survivor
    const usageCount = new Map<string, number>(); // Name -> Count
    const deptIdToName = new Map<string, string>();

    // Init with 0
    deptRows.forEach(r => {
        usageCount.set(r.get('name'), 0);
        deptIdToName.set(r.get('id'), r.get('name'));
    });

    // Count Projects (by agency Name)
    projectRows.forEach(r => {
        const agency = r.get('agency');
        if (agency) {
            usageCount.set(agency, (usageCount.get(agency) || 0) + 1);
        }
    });

    // Count Users (by department_id -> matches dept.id)
    userRows.forEach(r => {
        const dId = r.get('department_id');
        if (dId && deptIdToName.has(dId)) {
            const dName = deptIdToName.get(dId)!;
            usageCount.set(dName, (usageCount.get(dName) || 0) + 1);
        }
    });

    // 3. Group Duplicates
    interface DeptInfo {
        row: any;
        id: string;
        name: string;
        usage: number;
    }

    const groups = new Map<string, DeptInfo[]>();

    deptRows.forEach(row => {
        const name = row.get('name');
        // Normalization: Remove all spaces and dots, lowercase
        const key = name.replace(/\s+/g, '').replace(/\./g, '').toLowerCase();

        if (!groups.has(key)) groups.set(key, []);

        groups.get(key)!.push({
            row,
            id: row.get('id'),
            name,
            usage: usageCount.get(name) || 0
        });
    });

    // 4. Process Groups
    let deletedCount = 0;
    let updatedProjects = 0;
    let updatedUsers = 0;

    for (const [key, candidates] of groups.entries()) {
        if (candidates.length < 2) continue;

        console.log(`\nProcessing Group: "${key}"`);

        // Sort candidates: Descenting by Usage, then Length (longer is usually more descriptive? Or prefer dots?), then Alphabetical
        candidates.sort((a, b) => {
            if (b.usage !== a.usage) return b.usage - a.usage; // Most used wins
            // If tied, prefer the one with correct spacing (hard to judge, maybe shortest?)
            // Actually nice names usually have dots.
            // Let's just use alphabetical stability if usage tied.
            return a.name.localeCompare(b.name);
        });

        const survivor = candidates[0];
        const victims = candidates.slice(1);

        console.log(`  > Survivor: "${survivor.name}" (Usage: ${survivor.usage})`);
        console.log(`  > Merging ${victims.length} others into it...`);

        const victimNames = new Set(victims.map(v => v.name));
        const victimIds = new Set(victims.map(v => v.id));

        // Update Projects
        for (const pRow of projectRows) {
            const agency = pRow.get('agency');
            if (victimNames.has(agency)) {
                pRow.assign({ agency: survivor.name });
                await pRow.save(); // Save immediately to be safe
                updatedProjects++;
                process.stdout.write('.');
            }
        }

        // Update Users (by ID)
        if (userRows.length > 0) {
            for (const uRow of userRows) {
                const dId = uRow.get('department_id');
                if (victimIds.has(dId)) {
                    uRow.assign({ department_id: survivor.id });
                    await uRow.save();
                    updatedUsers++;
                    process.stdout.write('u');
                }
            }
        }

        // Delete Victim Rows in Departments
        for (const v of victims) {
            await v.row.delete();
            deletedCount++;
        }
    }

    console.log('\n\nMerge Complete!');
    console.log(`- Deleted Duplicate Departments: ${deletedCount}`);
    console.log(`- Updated Projects: ${updatedProjects}`);
    console.log(`- Updated Users: ${updatedUsers}`);
}

main().catch(console.error);
