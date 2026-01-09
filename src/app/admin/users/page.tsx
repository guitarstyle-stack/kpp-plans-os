import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import UserManagementClient from '@/components/UserManagementClient';

interface UserSession {
    userId: string;
    displayName: string;
    pictureUrl: string;
    role: string;
}

import SidebarLayout from '@/components/layout/SidebarLayout';

// ... (imports)

export default async function AdminUsersPage() {
    const sessionData = await getSession();
    const session = sessionData as unknown as UserSession;

    if (!session) {
        redirect('/');
    }

    if (session.role !== 'admin') {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
                    <p className="text-gray-600">You do not have permission to view this page.</p>
                    <a href="/dashboard" className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block">Return to Dashboard</a>
                </div>
            </div>
        );
    }

    return (
        <SidebarLayout user={session} activePage="users">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <UserManagementClient />
            </div>
        </SidebarLayout>
    );
}
