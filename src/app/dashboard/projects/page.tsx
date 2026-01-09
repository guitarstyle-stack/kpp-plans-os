import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getUser } from '@/lib/userDataService';
import { getDepartmentById } from '@/lib/departmentService';
import SidebarLayout from '@/components/layout/SidebarLayout';
import UserProjectsList from '@/components/UserProjectsList';

export default async function UserProjectsPage() {
    const session = await getSession();

    if (!session) {
        redirect('/');
    }

    // Get user's department
    let userDepartment = '';
    try {
        const user = await getUser(session.userId);
        if (user && user.department_id) {
            const dept = await getDepartmentById(user.department_id);
            if (dept) {
                userDepartment = dept.name;
            }
        }
    } catch (error) {
        console.error('Error fetching user department:', error);
    }

    return (
        <SidebarLayout user={session as any} activePage="projects">
            <div className="p-8">
                <UserProjectsList userDepartment={userDepartment} />
            </div>
        </SidebarLayout>
    );
}
