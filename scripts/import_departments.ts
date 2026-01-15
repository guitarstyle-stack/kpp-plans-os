
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

// 1. Load Environment Variables
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envConfig: Record<string, string> = {};

envContent.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        let value = valueParts.join('=');
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        }
        envConfig[key.trim()] = value.trim();
    }
});

const SERVICE_ACCOUNT_EMAIL = envConfig.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = envConfig.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const TARGET_SHEET_ID = envConfig.GOOGLE_SHEET_ID;
const SOURCE_SHEET_ID = '1kCdRd3Qj0PRdTTzC0J6IJV_toa9cqHF-';

if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY || !TARGET_SHEET_ID) {
    console.error('Missing required environment variables.');
    process.exit(1);
}

// 2. Auth Helper
const auth = new JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function main() {
    console.log('Starting Department Import...');

    // 3. Connect to Target Sheet (PlanOS)
    const targetDoc = new GoogleSpreadsheet(TARGET_SHEET_ID, auth);
    await targetDoc.loadInfo();
    console.log(`Connected to TARGET sheet: ${targetDoc.title}`);

    let departmentsSheet = targetDoc.sheetsByTitle['Departments'];
    if (!departmentsSheet) {
        console.log('Departments sheet not found, creating it...');
        departmentsSheet = await targetDoc.addSheet({ title: 'Departments', headerValues: ['id', 'name'] });
    }

    const existingRows = await departmentsSheet.getRows();
    const existingDepartments = new Set(existingRows.map(row => row.get('name').trim()));
    console.log(`Found ${existingDepartments.size} existing departments.`);

    // 4. Connect to Source Sheet
    const SOURCE_ID = '1HJyxgLoxoJPyjs5LRUl2VZATmxGC9SPlCiLyrNPFsqI';
    console.log(`Attempting to connect with ID: ${SOURCE_ID}`);

    let sourceDoc;
    try {
        sourceDoc = new GoogleSpreadsheet(SOURCE_ID, auth);
        await sourceDoc.loadInfo();
        console.log(`  > Success! Connected to: ${sourceDoc.title}`);
    } catch (e: any) {
        console.log(`  > Failed with ID: ${SOURCE_ID}`);
        console.log(`    Error details: ${e.message}`);
        if (e.response && e.response.data) {
            console.log(`    API Response: ${JSON.stringify(e.response.data)}`);
        }
        console.error('Failed to access Source Sheet. Please ensure the Service Account has access.');
        console.error(`Share the sheet with: ${SERVICE_ACCOUNT_EMAIL}`);
        process.exit(1);
    }

    const newDepartments = new Set<string>();

    // 5. Iterate Sheets and Collect Data
    for (const sheet of sourceDoc.sheetsByIndex) {
        console.log(`Scanning sheet: ${sheet.title}...`);

        try {
            // Load Row 2 to find column index (0-based index 1)
            await sheet.loadCells('A2:Z2'); // Assuming headers are within A-Z

            let targetColIndex = -1;
            for (let c = 0; c < 26; c++) {
                const cell = sheet.getCell(1, c); // Row 2 is index 1
                if (cell.value && cell.value.toString().includes('หน่วยดำเนินการ')) {
                    targetColIndex = c;
                    break;
                }
            }

            if (targetColIndex === -1) {
                console.log(`  - Helper: Column "หน่วยดำเนินการ" not found in Row 2 (A-Z). Skipping.`);
                continue;
            }

            console.log(`  + Found "หน่วยดำเนินการ" at column index ${targetColIndex}`);

            // Load data column (from Row 6 to end, or just Row 3+ to be safe)
            // Row 6 seems to be where data starts based on debug
            const startRow = 5; // Index 5 = Row 6
            const limit = 500; // Load chunk

            // We'll load a reasonable range. If sheet is huge, might need pagination, but let's try 1000 rows first.
            try {
                // Determine range: Column X, Row 6 -> 1000
                await sheet.loadCells({
                    startRowIndex: startRow,
                    endRowIndex: startRow + 500,
                    startColumnIndex: targetColIndex,
                    endColumnIndex: targetColIndex + 1
                });

                for (let r = startRow; r < startRow + 500; r++) {
                    const cell = sheet.getCell(r, targetColIndex);
                    const val = cell.value;
                    if (val && typeof val === 'string' && val.trim().length > 0) {
                        const normalized = val.trim();
                        // Filter out empty or obvious non-department strings
                        if (normalized !== 'หน่วยดำเนินการ' && normalized.length > 2 && !existingDepartments.has(normalized)) {
                            newDepartments.add(normalized);
                        }
                    }
                }
            } catch (err) {
                console.log(`    Error loading data cells: ${err}`);
            }

        } catch (error) {
            console.error(`  ! Error reading sheet ${sheet.title}:`, error);
        }
    }

    // 6. Insert New Departments
    console.log(`\nFound ${newDepartments.size} new unique departments.`);

    if (newDepartments.size > 0) {
        const rowsToAdd = Array.from(newDepartments).map(name => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name: name
        }));

        // Batch upload
        await departmentsSheet.addRows(rowsToAdd);
        console.log('Successfully imported new departments!');
    } else {
        console.log('No new departments to import.');
    }
}

main().catch(console.error);
