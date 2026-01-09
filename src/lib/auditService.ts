
import { doc, connectToSheet } from './googleSheets';

const AUDIT_SHEET_TITLE = 'AuditLogs';

export interface AuditLog {
    timestamp: string;
    actor: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXTENDED';
    target: string;
    details?: string;
    ip?: string;
}

export async function logAudit(
    actor: string,
    action: AuditLog['action'],
    target: string,
    details?: string,
    ip?: string
) {
    try {
        await connectToSheet();
        const sheet = doc.sheetsByTitle[AUDIT_SHEET_TITLE];

        // If sheet doesn't exist, we might want to log locally or just ignore to prevent crashing the app flow
        if (!sheet) {
            console.error(`Audit sheet '${AUDIT_SHEET_TITLE}' not found. Cannot log action.`);
            return;
        }

        const timestamp = new Date().toISOString();

        // Try to get IP from Next.js headers if not provided
        let clientIp = ip || '';
        if (!clientIp) {
            try {
                const { headers } = await import('next/headers');
                const headersList = await headers();
                clientIp = headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
                    headersList.get('x-real-ip') ||
                    headersList.get('cf-connecting-ip') ||
                    'unknown';
            } catch (e) {
                // If headers() fails (e.g., not in a server component context), use 'server'
                clientIp = 'server';
            }
        }

        await sheet.addRow({
            timestamp,
            actor,
            action,
            target,
            details: details || '',
            ip: clientIp
        });

        console.log(`[Audit] ${action} on ${target} by ${actor} from ${clientIp}`);
    } catch (error) {
        console.error('[Audit Error] Failed to log audit:', error);
        // We don't throw here to avoid disrupting the user operation
    }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
    try {
        await connectToSheet();
        const sheet = doc.sheetsByTitle[AUDIT_SHEET_TITLE];

        if (!sheet) {
            console.error(`Audit sheet '${AUDIT_SHEET_TITLE}' not found.`);
            return [];
        }

        const rows = await sheet.getRows();
        return rows.map((row) => ({
            timestamp: row.get('timestamp'),
            actor: row.get('actor'),
            action: row.get('action') as AuditLog['action'],
            target: row.get('target'),
            details: row.get('details'),
            ip: row.get('ip')
        })).reverse(); // Most recent first
    } catch (error) {
        console.error('[Audit Error] Failed to fetch audit logs:', error);
        return [];
    }
}

