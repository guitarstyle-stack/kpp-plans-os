import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SidebarLayout from '@/components/layout/SidebarLayout';
import AdminCategoriesClient from '@/components/AdminCategoriesClient';

interface UserSession {
    role: string;
    [key: string]: unknown;
}

export default async function AdminCategoriesPage() {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
        redirect('/');
    }

    return (
        <SidebarLayout user={session as unknown as UserSession} activePage="categories">
            <div className="p-8">
                <AdminCategoriesClient />
            </div>
        </SidebarLayout>
    );
}
