import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import SidebarLayout from '@/components/layout/SidebarLayout';
import ReportsClient from '@/components/ReportsClient';

interface UserSession {
    role: string;
    [key: string]: unknown;
}

export default async function ReportsPage() {
    const session = await getSession();

    if (!session) {
        redirect('/');
    }

    return (
        <SidebarLayout user={session as unknown as UserSession} activePage="report">
            <div className="p-8">
                <ReportsClient />
            </div>
        </SidebarLayout>
    );
}
