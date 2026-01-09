import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAuditLogs } from '@/lib/auditService';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    try {
        const logs = await getAuditLogs();
        return NextResponse.json(logs);
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
    }
}
