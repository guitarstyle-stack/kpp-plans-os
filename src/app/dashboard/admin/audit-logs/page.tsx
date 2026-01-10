import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import SidebarLayout from '@/components/layout/SidebarLayout';
import AuditLogsClient from '@/components/AuditLogsClient';

interface UserSession {
    role: string;
    [key: string]: unknown;
}

export default async function AuditLogsPage() {
    const session = await getSession();

    if (!session) {
        redirect('/');
    }

    if ((session as unknown as UserSession).role !== 'admin') {
        redirect('/dashboard');
    }

    return (
        <SidebarLayout user={session as unknown as UserSession} activePage="audit-logs">
            <div className="p-8">
                <AuditLogsClient />
            </div>
        </SidebarLayout>
    );
}
