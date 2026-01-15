
import * as fs from 'fs';
import * as path from 'path';

// Load Env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envConfig: Record<string, string> = {};
envContent.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key) {
        const val = valueParts.join('=').trim().replace(/^"|"$/g, '');
        envConfig[key.trim()] = val;
        process.env[key.trim()] = val; // Set to process.env for googleSheets.ts to pick up
    }
});

// Now import service
import { getDepartments } from '../src/lib/departmentService';

async function main() {
    console.log('Testing getDepartments()...');
    try {
        const depts = await getDepartments();
        console.log(`Fetched ${depts.length} departments.`);
        depts.forEach(d => {
            console.log(`- ${d.name} (${d.id}): '${d.organization_type}'`);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
