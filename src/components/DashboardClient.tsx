'use client';

import { Project, UserSession, StrategicPlan } from '@/lib/types'; // Use generic UserSession
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardStats from './dashboard/DashboardStats';
import DashboardCharts from './dashboard/DashboardCharts';
import SidebarLayout from './layout/SidebarLayout';

interface DashboardClientProps {
    initialProjects: Project[];
    user: UserSession | null;
    departmentName?: string;
}

export default function DashboardClient({ initialProjects, user, departmentName }: DashboardClientProps) {
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [selectedPlan, setSelectedPlan] = useState<string>('all');
    const [dashboardPlans, setDashboardPlans] = useState<StrategicPlan[]>([]);

    // Fetch plans when year changes
    useEffect(() => {
        if (selectedYear !== 'all') {
            fetchDashboardPlans(selectedYear);
        } else {
            setDashboardPlans([]);
        }
        setSelectedPlan('all');
    }, [selectedYear]);

    const fetchDashboardPlans = async (year: string) => {
        try {
            const res = await fetch(`/api/strategic-plans?fiscalYear=${year}`);
            if (res.ok) setDashboardPlans(await res.json());
        } catch (error) { console.error(error); }
    };

    // Filter projects
    const safeProjects = Array.isArray(initialProjects) ? initialProjects : [];

    // Get unique years
    const availableYears = Array.from(new Set(
        safeProjects.map(p => p.fiscal_year).filter(y => y)
    )).sort((a, b) => parseInt(b) - parseInt(a));

    let filteredProjects = selectedYear === 'all'
        ? safeProjects
        : safeProjects.filter(p => p.fiscal_year === selectedYear);

    if (selectedPlan !== 'all') {
        filteredProjects = filteredProjects.filter(p => p.strategicPlanId === selectedPlan);
    }

    const projects = filteredProjects;

    // Ensure user has required properties for SidebarLayout
    const safeUser = user || { userId: '', displayName: 'Guest', role: 'user', pictureUrl: '' };

    // Determine display name (Formal name preferred, fallback to display name)
    const formalName = safeUser.firstName && safeUser.lastName
        ? `${safeUser.firstName} ${safeUser.lastName}`
        : null;

    const showProfileWarning = !formalName;

    return (
        <SidebarLayout user={safeUser} activePage="dashboard">
            <div className="bg-gray-50 min-h-screen pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">แผงควบคุม (Dashboard)</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                ยินดีต้อนรับ,คุณ <span className="font-semibold text-gray-700">{formalName || safeUser.displayName || 'ผู้ใช้งาน'}</span>
                                {departmentName && (
                                    <>
                                        <span className="mx-2 text-gray-300">|</span>
                                        <span className="text-indigo-600 font-medium">หน่วยงาน: {departmentName}</span>
                                    </>
                                )}
                            </p>
                            {showProfileWarning && (
                                <div className="mt-3 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md shadow-sm">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700">
                                                <span className="font-medium">ข้อมูลยังไม่ครบถ้วน!</span> กรุณาระบุชื่อ-นามสกุลอย่างเป็นทางการ{' '}
                                                <Link href="/profile" className="font-semibold text-yellow-800 underline hover:text-yellow-900">
                                                    ที่หน้าโปรไฟล์
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Year Filter */}
                            <div className="relative">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                                >
                                    <option value="all">ปีงบประมาณทั้งหมด</option>
                                    {availableYears.map(year => (
                                        <option key={year} value={year}>ปี {year}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Plan Filter */}
                            <div className="relative">
                                <select
                                    value={dashboardPlans.length > 0 ? selectedPlan : 'empty'}
                                    onChange={(e) => setSelectedPlan(e.target.value)}
                                    disabled={dashboardPlans.length === 0}
                                    className="block w-full rounded-lg border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm max-w-[200px]"
                                >
                                    {dashboardPlans.length === 0 ? (
                                        <option value="empty">-เลือกปีงบประมาณก่อน-</option>
                                    ) : (
                                        <>
                                            <option value="all">ทุกแผนพัฒนารายประเด็น</option>
                                            {dashboardPlans.map(plan => (
                                                <option key={plan.id} value={plan.id}>{plan.name}</option>
                                            ))}
                                        </>
                                    )}
                                </select>
                            </div>

                            {safeUser.role === 'admin' ? (
                                <Link
                                    href="/dashboard/admin/projects"
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm whitespace-nowrap"
                                >
                                    จัดการโครงการ
                                </Link>
                            ) : (
                                <Link
                                    href="/dashboard/projects"
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm whitespace-nowrap"
                                >
                                    โครงการของฉัน
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* 1. Stats Cards */}
                    <DashboardStats projects={projects} />

                    {/* 2. Charts Section */}
                    {/* Pass plans to charts for label resolution/grouping */}
                    <DashboardCharts projects={projects} plans={dashboardPlans} />

                    {/* 3. Recent Projects / Projects List */}
                    {/* 3. Recent Projects / Projects List - Grouped by Status */}
                    {['ยังไม่ดำเนินการ', 'กำลังดำเนินการ', 'ดำเนินการแล้วเสร็จ'].map(status => {
                        // Filter projects for this status (handling English/Thai mapping if needed)
                        const statusProjects = projects.filter(p => {
                            if (status === 'ยังไม่ดำเนินการ') return p.status === 'ยังไม่ดำเนินการ' || p.status === 'Not Started' || !p.status;
                            if (status === 'กำลังดำเนินการ') return p.status === 'กำลังดำเนินการ' || p.status === 'In Progress';
                            if (status === 'ดำเนินการแล้วเสร็จ') return p.status === 'ดำเนินการแล้วเสร็จ' || p.status === 'Completed';
                            return false;
                        });

                        // Sort by ID or relevant field (descending) to show "recent" if implied, or just take slice
                        // Assuming projects are already in some order or just simple list.
                        // Let's reverse to show arguably 'newest' added if IDs are increasing?
                        // Or just slice. User requested "list ... 5 projects".

                        // Determine display color
                        const statusColor = status === 'ดำเนินการแล้วเสร็จ' ? 'text-green-700 bg-green-50 border-green-200' :
                            status === 'กำลังดำเนินการ' ? 'text-orange-700 bg-orange-50 border-orange-200' :
                                'text-gray-700 bg-gray-50 border-gray-200';

                        const headerColor = status === 'ดำเนินการแล้วเสร็จ' ? 'bg-green-100' :
                            status === 'กำลังดำเนินการ' ? 'bg-orange-100' : 'bg-gray-100';

                        if (statusProjects.length === 0) return null;

                        return (
                            <div key={status} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                                <div className={`px-6 py-4 border-b border-gray-100 flex justify-between items-center ${headerColor}`}>
                                    <div>
                                        <h3 className={`text-lg font-bold ${status === 'ดำเนินการแล้วเสร็จ' ? 'text-green-800' : status === 'กำลังดำเนินการ' ? 'text-orange-800' : 'text-gray-800'}`}>
                                            {status}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            พบ {statusProjects.length} โครงการ (แสดงล่าสุด 5 รายการ)
                                        </p>
                                    </div>
                                    <Link
                                        href={safeUser.role === 'admin' ? "/dashboard/admin/projects" : "/dashboard/projects"}
                                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap"
                                    >
                                        ดูทั้งหมด &rarr;
                                    </Link>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-white">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อโครงการ</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หน่วยงาน</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">งบประมาณ</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ความคืบหน้า</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {statusProjects.slice(0, 5).map((project) => (
                                                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={project.project_name || project.name}>
                                                            {project.project_name || project.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {project.agency}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {Number(project.budget).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                                                                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                                            </div>
                                                            <span className="text-sm text-gray-500">{project.progress}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}

                    {/* Show message if no projects at all */}
                    {projects.length === 0 && (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                            ยังไม่มีข้อมูลโครงการ
                        </div>
                    )}
                </div>
            </div>
        </SidebarLayout>
    );
}
