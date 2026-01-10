import { NextResponse } from 'next/server';
import { doc, connectToSheet } from '@/lib/googleSheets';

export async function GET() {
    try {
        await connectToSheet();
        const sheet = doc.sheetsByTitle['Users'];
        if (!sheet) {
            return NextResponse.json({ error: 'Sheet Users not found' }, { status: 404 });
        }

        // Load header row
        await sheet.loadHeaderRow();

        return NextResponse.json({
            headers: sheet.headerValues
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
