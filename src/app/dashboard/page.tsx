import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getProjects } from '@/lib/dataService';
import DashboardClient from '@/components/DashboardClient';

import { getUser } from '@/lib/userDataService';

import { Project, UserSession } from '@/lib/types';

import { getDepartmentById } from '@/lib/departmentService';

// ... (existing imports)



export default async function DashboardPage() {
    const sessionData = await getSession();
    const session = sessionData as unknown as UserSession;

    if (!session) {
        redirect('/');
    }

    // Server-side fetch for initial data
    let projects: Project[] = [];
    let user = null;

    try {
        const [allProjects, userData] = await Promise.all([
            getProjects(),
            getUser(session.userId)
        ]);

        user = userData;
        const typedProjects = allProjects as unknown as Project[];

        // Filter projects based on role
        if (user?.role === 'admin' || session.role === 'admin') {
            projects = typedProjects;
        } else {
            // Non-admin: Filter by department
            if (user?.department_id) {
                const department = await getDepartmentById(user.department_id);
                if (department) {
                    projects = typedProjects.filter(p => p.agency === department.name);
                }
            }
        }

    } catch (error) {
        console.error('Failed to fetch data server-side:', error);
    }

    // Map User or Session to UserSession expected by client
    const userProp: UserSession = user ? {
        userId: user.id || session.userId,
        displayName: user.display_name || session.displayName,
        firstName: user.first_name,
        lastName: user.last_name,
        pictureUrl: user.picture_url || session.pictureUrl,
        role: user.role || session.role,
    } : {
        userId: session.userId,
        displayName: session.displayName,
        pictureUrl: session.pictureUrl,
        role: session.role
    };

    let departmentName = '';
    if (user?.department_id) {
        const dept = await getDepartmentById(user.department_id);
        if (dept) {
            departmentName = dept.name;
        }
    }

    return <DashboardClient initialProjects={projects} user={userProp} departmentName={departmentName} />;
}
