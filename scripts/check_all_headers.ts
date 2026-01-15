
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

const DEFINED_HEADERS: Record<string, string[]> = {
    'Departments': ['id', 'name', 'organization_type'],
    'Users': [
        'id', 'line_user_id', 'display_name', 'picture_url', 'role', 'status',
        'last_login', 'first_name', 'last_name', 'position', 'department_id',
        'phone', 'email'
    ],
    'Projects': [
        'id', 'name', 'agency', 'target_group', 'budget', 'source', 'status',
        'progress', 'project_name', 'start_date', 'end_date', 'responsible_person',
        'description', 'last_updated', 'fiscal_year', 'budget_spent', 'performance', 'categoryId',
        'development_guideline', 'governance_indicator', 'annual_target', 'objective', 'support_agency',
        'strategicPlanId', 'strategicGoalId', 'target_group_amount'
    ],
    'Indicators': ['id', 'projectId', 'name', 'target', 'unit', 'result'],
    'Reports': [
        'id', 'projectId', 'userId', 'submissionDate', 'progress',
        'budgetSpent', 'performance', 'issues', 'activities', 'indicatorResults'
    ],
    'ProjectCategories': ['id', 'name', 'description', 'fiscal_year'],
    'StrategicPlans': ['id', 'name', 'fiscal_year', 'description'],
    'StrategicGoals': ['id', 'planId', 'name', 'description'],
    'StrategicIndicators': ['id', 'goalId', 'name', 'recommended_target', 'unit', 'description']
};

async function main() {
    const doc = new GoogleSpreadsheet(envConfig.GOOGLE_SHEET_ID, auth);
    await doc.loadInfo();
    console.log(`Connected to: ${doc.title}`);

    for (const [sheetTitle, requiredHeaders] of Object.entries(DEFINED_HEADERS)) {
        console.log(`\nChecking sheet: ${sheetTitle}...`);
        const sheet = doc.sheetsByTitle[sheetTitle];

        if (!sheet) {
            console.log(`Sheet '${sheetTitle}' not found. Creating...`);
            await doc.addSheet({ title: sheetTitle, headerValues: requiredHeaders });
            console.log(`Created '${sheetTitle}' with headers.`);
            continue;
        }

        await sheet.loadHeaderRow();
        const currentHeaders = sheet.headerValues;
        const missingHeaders = requiredHeaders.filter(h => !currentHeaders.includes(h));

        if (missingHeaders.length > 0) {
            console.log(`Missing headers in '${sheetTitle}':`, missingHeaders);
            console.log('Adding missing headers...');
            const newHeaders = [...currentHeaders, ...missingHeaders];
            await sheet.setHeaderRow(newHeaders);
            console.log(`Updated '${sheetTitle}' headers.`);
        } else {
            console.log(`'${sheetTitle}' headers are OK.`);
        }
    }
}

main().catch(console.error);
