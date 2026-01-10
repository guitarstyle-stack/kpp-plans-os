import { Project } from '@/lib/types';
import { useMemo } from 'react';

interface DashboardStatsProps {
    projects: Project[];
}

export default function DashboardStats({ projects }: DashboardStatsProps) {
    const stats = useMemo(() => {
        const totalProjects = projects.length;

        // Calculate Total Budget
        const totalBudget = projects.reduce((sum, p) => {
            const cleanBudget = p.budget.replace(/,/g, '');
            return sum + (parseFloat(cleanBudget) || 0);
        }, 0);

        // Calculate Average Progress
        const avgProgress = totalProjects > 0
            ? projects.reduce((sum, p) => sum + (parseFloat(p.progress) || 0), 0) / totalProjects
            : 0;

        // Count Projects by Status
        const completed = projects.filter(p => p.status === 'Completed' || p.status === 'ดำเนินการแล้วเสร็จ' || p.progress === '100').length;
        const delayed = projects.filter(p => p.status === 'Delayed' || p.status === 'ล่าช้า').length;

        return {
            totalProjects,
            totalBudget: totalBudget.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }),
            avgProgress: avgProgress.toFixed(1),
            completed,
            delayed
        };
    }, [projects]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Projects */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">โครงการทั้งหมด</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.totalProjects}</h3>
                </div>
            </div>

            {/* Total Budget */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-green-50 rounded-full text-green-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">งบประมาณรวม</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.totalBudget}</h3>
                </div>
            </div>

            {/* Average Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">ความคืบหน้าเฉลี่ย</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.avgProgress}%</h3>
                </div>
            </div>

            {/* Completed Projects */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">โครงการแล้วเสร็จ</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.completed}</h3>
                </div>
            </div>
        </div>
    );
}
