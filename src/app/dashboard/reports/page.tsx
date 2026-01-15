import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getUser } from '@/lib/userDataService';
import SidebarLayout from '@/components/layout/SidebarLayout';
import ReportsClient from '@/components/ReportsClient';

interface UserSession {
    role: string;
    [key: string]: unknown;
}

export default async function ReportsPage() {
    const sessionData = await getSession();
    const session = sessionData as unknown as any;

    if (!session) {
        redirect('/');
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
        <SidebarLayout user={sidebarUser} activePage="report">
            <div className="p-8">
                <ReportsClient />
            </div>
        </SidebarLayout>
    );
}
