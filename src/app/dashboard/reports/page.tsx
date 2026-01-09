import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import SidebarLayout from '@/components/layout/SidebarLayout';
import ReportsClient from '@/components/ReportsClient';

export default async function ReportsPage() {
    const session = await getSession();

    if (!session) {
        redirect('/');
    }

    return (
        <SidebarLayout user={session as any} activePage="report">
            <div className="p-8">
                <ReportsClient />
            </div>
        </SidebarLayout>
    );
}
