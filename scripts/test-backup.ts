import { backupToSheets } from '../src/lib/backupService';

async function main() {
    console.log('Testing backup service...');
    try {
        const result = await backupToSheets();
        console.log('Backup Result:', result);
    } catch (error) {
        console.error('Backup Failed:', error);
        process.exit(1);
    }
}

main();
