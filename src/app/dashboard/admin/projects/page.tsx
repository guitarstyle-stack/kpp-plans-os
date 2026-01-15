import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getUser } from '@/lib/userDataService';
import SidebarLayout from '@/components/layout/SidebarLayout';
import AdminProjectsManagement from '@/components/admin/AdminProjectsManagement';

interface UserSession {
    role: string;
    [key: string]: unknown;
}

export default async function AdminProjectsPage() {
    const sessionData = await getSession();
    const session = sessionData as unknown as any; // Cast for easier access

    if (!session) {
        redirect('/');
    }

    if (session.role !== 'admin') {
        redirect('/dashboard');
    }

    const user = await getUser(session.userId);

    const sidebarUser = user ? {
        userId: user.id || session.userId,
        displayName: user.display_name || session.displayName,
        display_name: user.display_name,
        firstName: user.first_name,
        lastName: user.last_name,
        first_name: user.first_name,
        last_name: user.last_name,
        pictureUrl: user.picture_url || session.pictureUrl,
        role: user.role || session.role,
    } : session;

    return (
        <SidebarLayout user={sidebarUser} activePage="admin-projects">
            <div className="p-8">
                <AdminProjectsManagement />
            </div>
        </SidebarLayout>
    );
}
