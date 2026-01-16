import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Load .env manually
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    });
}

const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID as string, serviceAccountAuth);

async function main() {
    console.log('Connecting to Google Sheet...');
    await doc.loadInfo();
    console.log(`Connected to: ${doc.title}`);

    const userSheet = doc.sheetsByTitle['Users'];
    if (!userSheet) {
        console.error('Sheet "Users" not found!');
        return;
    }

    console.log('Loading header row...');
    await userSheet.loadHeaderRow();
    console.log('Headers:', userSheet.headerValues);

    const rows = await userSheet.getRows({ limit: 5 });
    console.log(`Loaded ${rows.length} sample rows.`);

    if (rows.length > 0) {
        const row = rows[0];
        console.log('Sample Row 1 Data:');
        console.log(`- id: ${row.get('id')}`);
        console.log(`- username: ${row.get('username')}`); // Check if this col exists
        console.log(`- email: ${row.get('email')}`);
        console.log(`- display_name: ${row.get('display_name')}`);
        console.log(`- role: ${row.get('role')}`);
        console.log(`- department_id: ${row.get('department_id')}`);
        console.log('Raw Row Data:', row.toObject());
    }
}

main().catch(console.error);
