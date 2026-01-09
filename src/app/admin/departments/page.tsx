import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DepartmentsClient from '@/components/DepartmentsClient';

import SidebarLayout from '@/components/layout/SidebarLayout';

// ...

export default async function DepartmentsPage() {
    const session = await getSession();

    if (!session || (session as any).role !== 'admin') {
        redirect('/');
    }

    return (
        <SidebarLayout user={session as any} activePage="departments">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <DepartmentsClient />
            </div>
        </SidebarLayout>
    );
}
