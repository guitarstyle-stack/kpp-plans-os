
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
    console.log(`Connected to: ${doc.title}`);

    const sheet = doc.sheetsByTitle['Departments'];
    if (!sheet) {
        console.error('Departments sheet not found!');
        return;
    }

    const rows = await sheet.getRows();
    if (rows.length === 0) {
        console.log('No rows to test update on.');
        return;
    }

    const row = rows[0];
    const initialType = row.get('organization_type');
    console.log(`Initial Type: '${initialType}'`);

    console.log('Attempting to update to "government"...');
    row.assign({ organization_type: 'government' });
    await row.save();
    console.log('Saved.');

    // Reload
    console.log('Reloading rows...');
    // We can't just reload the row instance, we usually fetch new rows
    const newRows = await sheet.getRows();
    const newRow = newRows[0]; // Assuming order persists or only 1 row
    const newType = newRow.get('organization_type');
    console.log(`New Type: '${newType}'`);

    if (newType === 'government') {
        console.log('SUCCESS: Type updated correctly.');
    } else {
        console.error('FAILURE: Type did not update.');
    }
}

main().catch(console.error);
