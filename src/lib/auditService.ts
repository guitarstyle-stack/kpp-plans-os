
import { prisma } from './prisma';

export interface AuditLog {
    id: string;
    timestamp: Date;
    actor: string;
    action: string;
    target: string;
    details: string | null;
    ip: string | null;
}

export async function logAudit(
    actor: string,
    action: string,
    target: string,
    details?: string,
    ip?: string
) {
    try {
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
            } catch {
                clientIp = 'server';
            }
        }

        await prisma.auditLog.create({
            data: {
                actor: actor,
                action: action,
                target: target,
                details: details || '',
                ip: clientIp,
            }
        });

        console.log(`[Audit] ${action} on ${target} by ${actor} from ${clientIp}`);
    } catch (error) {
        console.error('[Audit Error] Failed to log audit:', error);
    }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 100 // Limit for performance
        });
        return logs;
    } catch (error) {
        console.error('[Audit Error] Failed to fetch audit logs:', error);
        return [];
    }
}

