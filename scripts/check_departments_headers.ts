
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

    await sheet.loadHeaderRow();
    console.log('Current Headers:', sheet.headerValues);

    const requiredHeaders = ['id', 'name', 'organization_type'];
    const missingHeaders = requiredHeaders.filter(h => !sheet.headerValues.includes(h));

    if (missingHeaders.length > 0) {
        console.log('Missing headers:', missingHeaders);
        console.log('Adding missing headers...');
        const newHeaders = [...sheet.headerValues, ...missingHeaders];
        await sheet.setHeaderRow(newHeaders);
        console.log('Headers updated to:', newHeaders);
    } else {
        console.log('All headers present.');
    }
}

main().catch(console.error);
