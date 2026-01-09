import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import SidebarLayout from '@/components/layout/SidebarLayout';
import AdminProjectsManagement from '@/components/admin/AdminProjectsManagement';

export default async function AdminProjectsPage() {
    const session = await getSession();

    if (!session) {
        redirect('/');
    }

    if (session.role !== 'admin') {
        redirect('/dashboard');
    }

    return (
        <SidebarLayout user={session as any} activePage="admin-projects">
            <div className="p-8">
                <AdminProjectsManagement />
            </div>
        </SidebarLayout>
    );
}
