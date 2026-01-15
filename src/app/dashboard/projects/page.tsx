import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getUser } from '@/lib/userDataService';
import { getDepartmentById } from '@/lib/departmentService';
import { getProjectCategories } from '@/lib/dataService';
import SidebarLayout from '@/components/layout/SidebarLayout';
import UserProjectsList from '@/components/UserProjectsList';

export const dynamic = 'force-dynamic';

interface UserSession {
    userId: string;
    role: string;
    [key: string]: unknown;
}

export default async function UserProjectsPage() {
    const sessionData = await getSession();
    const session = sessionData as unknown as UserSession;

    if (!session) {
        redirect('/');
    }

    // Get user's department
    let userDepartment = '';
    let userDepartmentId = '';
    // const categories = await getProjectCategories(); // Removed category usage

    let sidebarUser = session;

    try {
        const user = await getUser(session.userId);
        if (user && user.department_id) {
            userDepartmentId = user.department_id;
            const dept = await getDepartmentById(user.department_id);
            if (dept) {
                userDepartment = dept.name;
            }
        }

        if (user) {
            sidebarUser = {
                userId: user.id || session.userId,
                displayName: user.display_name || session.displayName as string,
                display_name: user.display_name,
                firstName: user.first_name,
                lastName: user.last_name,
                first_name: user.first_name,
                last_name: user.last_name,
                pictureUrl: user.picture_url || session.pictureUrl as string,
                role: user.role || session.role,
            };
        }

        console.log('Server Page - Fetched User:', user);
        console.log('Server Page - User Department ID:', userDepartmentId);
    } catch (error) {
        console.error('Error fetching user department:', error);
    }

    return (
        <SidebarLayout user={sidebarUser as UserSession} activePage="projects">
            <div className="p-8">
                <UserProjectsList userDepartment={userDepartment} userDepartmentId={userDepartmentId} />
            </div>
        </SidebarLayout>
    );
}
