import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getProjects } from '@/lib/dataService';
import DashboardClient from '@/components/DashboardClient';

import { getUser } from '@/lib/userDataService';

interface UserSession {
    userId: string;
    displayName: string;
    pictureUrl: string;
    role: string;
}

import { getDepartmentById } from '@/lib/departmentService';

// ... (existing imports)

export default async function DashboardPage() {
    const sessionData = await getSession();
    const session = sessionData as unknown as UserSession;

    if (!session) {
        redirect('/');
    }

    // Server-side fetch for initial data
    let projects: any[] = [];
    let user = null;

    try {
        const [allProjects, userData] = await Promise.all([
            getProjects(),
            getUser(session.userId)
        ]);

        user = userData;

        // Filter projects based on role
        if (user?.role === 'admin' || session.role === 'admin') {
            projects = allProjects;
        } else {
            // Non-admin: Filter by department
            if (user?.department_id) {
                const department = await getDepartmentById(user.department_id);
                if (department) {
                    projects = allProjects.filter(p => p.agency === department.name);
                }
            }
        }

    } catch (error) {
        console.error('Failed to fetch data server-side:', error);
    }

    // Fallback to session data if DB fetch fails, but preferably use DB data
    const userProp = user || session;

    return <DashboardClient initialProjects={projects} user={userProp} />;
}
