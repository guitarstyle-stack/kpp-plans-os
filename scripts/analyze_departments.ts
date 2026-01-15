
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
    const doc = new GoogleSpreadsheet(envConfig.GOOGLE_SHEET_ID, auth);
    await doc.loadInfo();
    console.log(`Analyzing Departments in: ${doc.title}`);

    const sheet = doc.sheetsByTitle['Departments'];
    if (!sheet) {
        console.error('Departments sheet not found');
        return;
    }

    const rows = await sheet.getRows();
    const depts = rows.map(r => ({
        id: r.get('id'),
        name: r.get('name'),
        normalized: r.get('name').replace(/\s+/g, '').replace(/\./g, '').toLowerCase()
    }));

    console.log(`Total Departments: ${depts.length}\n`);

    // 1. Check for exact duplicates (normalized)
    const map = new Map<string, string[]>();
    depts.forEach(d => {
        if (!map.has(d.normalized)) map.set(d.normalized, []);
        map.get(d.normalized)?.push(d.name);
    });

    console.log('--- Potential Duplicates (Normalized Match) ---');
    let found = false;
    for (const [key, names] of map.entries()) {
        if (names.length > 1) {
            // Check if they are actually different strings
            const uniqueNames = new Set(names);
            if (uniqueNames.size > 1) {
                console.log(`Group: ${names.join(' | ')}`);
                found = true;
            }
        }
    }
    if (!found) console.log('No obvious spacing/punctuation duplicates found.');

    console.log('\n--- All Departments (Sorted) ---');
    depts.sort((a, b) => a.name.localeCompare(b.name, 'th'));
    depts.forEach(d => console.log(d.name));
}

main().catch(console.error);
