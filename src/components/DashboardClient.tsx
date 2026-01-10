'use client';

import { Project, UserSession } from '@/lib/types'; // Use generic UserSession
import { useState } from 'react';
import Link from 'next/link';
import DashboardStats from './dashboard/DashboardStats';
import DashboardCharts from './dashboard/DashboardCharts';
import SidebarLayout from './layout/SidebarLayout';

interface DashboardClientProps {
    initialProjects: Project[];
    user: UserSession | null;
}

export default function DashboardClient({ initialProjects, user }: DashboardClientProps) {
    const [projects] = useState<Project[]>(initialProjects);

    // Ensure user has required properties for SidebarLayout
    const safeUser = user || { userId: '', displayName: 'Guest', role: 'user', pictureUrl: '' };

    return (
        <SidebarLayout user={safeUser} activePage="dashboard">
            <div className="bg-gray-50 min-h-screen pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">แผงควบคุม (Dashboard)</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                ยินดีต้อนรับ, {safeUser.displayName || 'ผู้ใช้งาน'}
                            </p>
                        </div>
                        {safeUser.role === 'admin' ? (
                            <Link
                                href="/dashboard/admin/projects"
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
                            >
                                จัดการโครงการ
                            </Link>
                        ) : (
                            <Link
                                href="/dashboard/projects"
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
                            >
                                โครงการของฉัน
                            </Link>
                        )}
                    </div>

                    {/* 1. Stats Cards */}
                    <DashboardStats projects={projects} />

                    {/* 2. Charts Section */}
                    <DashboardCharts projects={projects} />

                    {/* 3. Recent Projects / Projects List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">โครงการล่าสุด (5 รายการ)</h3>
                            <Link
                                href={safeUser.role === 'admin' ? "/dashboard/admin/projects" : "/dashboard/projects"}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                ดูทั้งหมด &rarr;
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อโครงการ</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หน่วยงาน</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">งบประมาณ</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ความคืบหน้า</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {projects.slice(0, 5).map((project) => (
                                        <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={project.project_name || project.name}>
                                                    {project.project_name || project.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {project.agency}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${project.status === 'Completed' || project.status === 'ดำเนินการแล้วเสร็จ' ? 'bg-green-100 text-green-800' :
                                                        project.status === 'In Progress' || project.status === 'กำลังดำเนินการ' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                    {project.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {project.budget}
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
                        {projects.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                ยังไม่มีข้อมูลโครงการ
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
