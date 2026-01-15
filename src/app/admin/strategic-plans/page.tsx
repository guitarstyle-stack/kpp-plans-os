
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import SidebarLayout from '@/components/layout/SidebarLayout';
import StrategicPlanManager from '@/components/admin/StrategicPlanManager';
import { getUser } from '@/lib/userDataService';

interface UserSession {
    role: string;
    [key: string]: unknown;
}

export default async function StrategicPlansPage() {
    const sessionData = await getSession();
    const session = sessionData as unknown as any;

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
        <SidebarLayout user={sidebarUser} activePage="strategic-plans">
            <div className="p-8 h-screen overflow-hidden flex flex-col">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">จัดการแผนพัฒนารายประเด็น (Master Data)</h1>
                    <p className="text-gray-500">กำหนดโครงสร้างแผนงาน เป้าหมาย และตัวชี้วัดประจำปีงบประมาณ</p>
                </div>
                <div className="flex-1 overflow-hidden">
                    <StrategicPlanManager />
                </div>
            </div>
        </SidebarLayout>
    );
}
