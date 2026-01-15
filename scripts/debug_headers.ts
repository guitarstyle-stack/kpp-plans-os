
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
    const doc = new GoogleSpreadsheet('1HJyxgLoxoJPyjs5LRUl2VZATmxGC9SPlCiLyrNPFsqI', auth);
    await doc.loadInfo();
    console.log(`Debug Headers for: ${doc.title}`);

    const sheet = doc.sheetsByIndex[0]; // First sheet: ผู้สูงอายุ
    console.log(`Sheet Title: ${sheet.title}`);

    // Load headers/rows
    await sheet.loadHeaderRow(); // Default row 1
    console.log('Row 1 Headers:', sheet.headerValues);

    // Try loading first few rows to see if headers are deeper
    const rows = await sheet.getRows({ limit: 5 });
    rows.forEach((row, i) => {
        console.log(`Row ${i + 2} data:`, row.toObject());
    });
}

main().catch(console.error);
