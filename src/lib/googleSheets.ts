import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Initialize auth - simplified for server-side usage
const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID as string, serviceAccountAuth);

export async function connectToSheet() {
    try {
        await doc.loadInfo();
        console.log(`Connected to sheet: ${doc.title}`);
        return doc;
    } catch (error) {
        console.error('Error connecting to Google Sheet:', error);
        throw error;
    }
}
