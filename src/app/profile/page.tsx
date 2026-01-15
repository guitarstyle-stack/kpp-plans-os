import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getUser } from '@/lib/userDataService';
import ProfileClient from '@/components/ProfileClient';
import SidebarLayout from '@/components/layout/SidebarLayout';

interface UserSession {
    userId: string;
    displayName: string;
    pictureUrl: string;
    role: string;
}

export default async function ProfilePage() {
    const sessionData = await getSession();
    const session = sessionData as unknown as UserSession;

    if (!session) {
        redirect('/');
    }

    const user = await getUser(session.userId);

    if (!user) {
        redirect('/'); // Should not happen if session exists, but safety check
    }

    return (
        <SidebarLayout
            user={{
                userId: user.id,
                displayName: user.display_name,
                display_name: user.display_name,
                firstName: user.first_name,
                lastName: user.last_name,
                first_name: user.first_name,
                last_name: user.last_name,
                pictureUrl: user.picture_url,
                picture_url: user.picture_url,
                role: user.role
            }}
            activePage="profile"
        >
            <div className="p-8 bg-gray-50 min-h-screen">
                <ProfileClient user={user} />
            </div>
        </SidebarLayout>
    );
}
