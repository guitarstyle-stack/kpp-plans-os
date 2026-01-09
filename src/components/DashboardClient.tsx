'use client';

import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Project } from '@/lib/types';
import SidebarLayout from './layout/SidebarLayout';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardClient({ initialProjects, user }: { initialProjects: Project[], user: any }) {
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [hasMounted, setHasMounted] = useState(false);
    const [selectedYear, setSelectedYear] = useState<string | 'all'>('all');

    // Check if user needs to complete profile
    const isIncompleteProfile = user.role !== 'admin' && !user.department_id;

    // Use fiscal_year directly from project data
    const getProjectYear = (p: Project) => {
        if (p.fiscal_year) return p.fiscal_year; // Expecting string like "2568"

        // Fallback calculation if column is empty
        if (!p.start_date) return null;
        try {
            let date: Date;
            if (p.start_date.includes('/')) {
                const parts = p.start_date.split('/');
                if (parts.length === 3) date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                else return null;
            } else {
                date = new Date(p.start_date);
            }
            if (isNaN(date.getTime())) return null;
            const month = date.getMonth() + 1; // 0-indexed
            const year = date.getFullYear();
            // Thai Fiscal Year: Oct (10) starts next year
            const fiscalYearAD = month >= 10 ? year + 1 : year;
            return (fiscalYearAD + 543).toString();
        } catch (e) {
            return null;
        }
    };

    // Compute available years
    const availableYears = Array.from(new Set(
        initialProjects.map(p => getProjectYear(p)).filter(y => y !== null)
    )).sort((a, b) => parseInt(b as string) - parseInt(a as string)); // Descending

    useEffect(() => {
        setHasMounted(true);
        // Set initial year after mount
        if (availableYears.length > 0) {
            setSelectedYear(availableYears[0] as string);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Filter projects based on year
    const filteredProjects = selectedYear === 'all'
        ? projects
        : projects.filter(p => getProjectYear(p) === selectedYear);

    const refreshProjects = async () => {
        const res = await fetch('/api/projects');
        if (res.ok) {
            const data = await res.json();
            setProjects(data);
        }
    };

    if (!hasMounted) {
        return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;
    }

    const handleEdit = async (id: string, currentProgress: string) => {
        const progress = prompt('Update Progress (0-100):', currentProgress);
        if (progress !== null) {
            await fetch(`/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ progress }),
            });
            refreshProjects();
        }
    };

    // Stats Calculation
    const totalBudget = filteredProjects.reduce((sum, p) => sum + (parseFloat(p.budget.replace(/,/g, '')) || 0), 0);
    const completed = filteredProjects.filter(p => p.status === 'Completed' || p.status === 'ดำเนินการแล้วเสร็จ').length;
    const inProgress = filteredProjects.filter(p => p.status === 'In Progress' || p.status === 'อยู่ระหว่างดำเนินการ' || p.status === 'กำลังดำเนินการ').length;

    // Chart Data
    const dataWithDates = filteredProjects.filter((p) => p.start_date && p.end_date).map((p) => {
        const parse = (d: string) => {
            if (!d) return null;
            const parts = d.split('/');
            return parts.length === 3 ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime() : new Date(d).getTime();
        };
        const start = parse(p.start_date);
        const end = parse(p.end_date);
        if (!start || !end || isNaN(start) || isNaN(end)) return null;

        return {
            x: [start, end],
            y: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
            status: p.status,
        };
    }).filter((p): p is { x: number[]; y: string; status: string } => p !== null);

    const chartData = {
        labels: dataWithDates.map((d) => d.y),
        datasets: [
            {
                label: 'ช่วงเวลาดำเนินโครงการ',
                data: dataWithDates.map((d) => d.x),
                backgroundColor: dataWithDates.map((d) => {
                    const s = d.status?.trim();
                    if (s === 'Completed' || s === 'ดำเนินการแล้วเสร็จ') return 'rgba(34, 197, 94, 0.7)';
                    if (s === 'In Progress' || s === 'อยู่ระหว่างดำเนินการ') return 'rgba(234, 179, 8, 0.7)';
                    return 'rgba(99, 102, 241, 0.7)';
                }),
                borderColor: dataWithDates.map((d) => {
                    const s = d.status?.trim();
                    if (s === 'Completed' || s === 'ดำเนินการแล้วเสร็จ') return 'rgb(34, 197, 94)';
                    if (s === 'In Progress' || s === 'อยู่ระหว่างดำเนินการ') return 'rgb(234, 179, 8)';
                    return 'rgb(99, 102, 241)';
                }),
                borderWidth: 1,
                borderRadius: 5,
                barPercentage: 0.5,
            },
        ],
    };

    const chartOptions: any = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                position: 'top',
                type: 'linear',
                min: Math.min(...dataWithDates.map(d => d.x[0] || 0)) || undefined,
                max: Math.max(...dataWithDates.map(d => d.x[1] || 0)) || undefined,
                ticks: {
                    callback: (value: number) => new Date(value).toLocaleDateString('th-TH', { month: 'short', year: '2-digit' }),
                },
            },
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const start = new Date(context.raw[0]).toLocaleDateString('th-TH');
                        const end = new Date(context.raw[1]).toLocaleDateString('th-TH');
                        return `ระยะเวลา: ${start} - ${end}`;
                    }
                }
            }
        },
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount);
    const getStatusColor = (status: string) => {
        if (!status) return 'bg-gray-100 text-gray-800';
        const s = status.trim();
        if (s === 'Completed' || s === 'ดำเนินการแล้วเสร็จ') return 'bg-green-100 text-green-800';
        if (s === 'In Progress' || s === 'อยู่ระหว่างดำเนินการ' || s === 'กำลังดำเนินการ') return 'bg-yellow-100 text-yellow-800';
        return 'bg-gray-100 text-gray-800';
    };

    const sidebarFilters = null; // Removing old bottom filter

    const topFilter = (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-xl shadow-lg transform transition-all hover:scale-[1.02]">
            <label className="block text-xs font-bold text-indigo-100 uppercase tracking-wider mb-2 flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                ปีงบประมาณ
            </label>
            <div className="relative">
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="block w-full border-0 bg-white/20 text-white placeholder-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-white focus:bg-white/30 transition-colors py-2.5 px-3 font-semibold appearance-none cursor-pointer"
                    style={{ backgroundImage: 'none' }} // Remove default arrow to custom style
                >
                    {availableYears.map(y => (
                        <option key={y as string} value={y as string} className="text-gray-900 bg-white">{y}</option>
                    ))}
                    <option value="all" className="text-gray-900 bg-white">ทั้งหมด</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </div>
    );

    return (
        <SidebarLayout user={user} activePage="dashboard" topSidebarContent={topFilter}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 font-display">แผงควบคุมหลัก</h1>
                        <p className="mt-1 text-sm text-gray-500">สรุปผลการดำเนินงานประจำปีงบประมาณ {selectedYear === 'all' ? 'ทั้งหมด' : selectedYear}</p>
                    </div>
                </div>

                {isIncompleteProfile && (
                    <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm leading-5 font-medium text-yellow-800">
                                    กรุณาระบุสังกัดของคุณ
                                </h3>
                                <div className="mt-2 text-sm leading-5 text-yellow-700">
                                    <p>
                                        คุณยังไม่ได้ระบุหน่วยงานต้นสังกัด เพื่อให้สามารถจัดการโครงการได้ กรุณาไปที่หน้า
                                        <a href="/profile" className="font-bold underline ml-1 hover:text-yellow-900">แก้ไขข้อมูลส่วนตัว</a>
                                        เพื่อเลือกหน่วยงานครับ
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    {/* Budget Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start">
                            <div>
                                <dt className="text-sm font-medium text-gray-500 truncate">งบประมาณรวม</dt>
                                <dd className="mt-2 text-3xl font-bold text-gray-900 font-display">{formatCurrency(totalBudget)}</dd>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-blue-600 font-medium">
                            <span className="bg-blue-50 px-2 py-1 rounded-md">อนุมัติแล้ว</span>
                        </div>
                    </div>

                    {/* Total Projects Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start">
                            <div>
                                <dt className="text-sm font-medium text-gray-500 truncate">โครงการทั้งหมด {selectedYear !== 'all' && `(${selectedYear})`}</dt>
                                <dd className="mt-2 text-3xl font-bold text-gray-900 font-display">{filteredProjects.length}</dd>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-purple-600 font-medium">
                            <span className="bg-purple-50 px-2 py-1 rounded-md">ทุกสถานะ</span>
                        </div>
                    </div>

                    {/* Completed Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start">
                            <div>
                                <dt className="text-sm font-medium text-gray-500 truncate">ดำเนินการแล้วเสร็จ</dt>
                                <dd className="mt-2 text-3xl font-bold text-green-600 font-display">{completed}</dd>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
                            <span className="bg-green-50 px-2 py-1 rounded-md">{((completed / (filteredProjects.length || 1)) * 100).toFixed(0)}% ของทั้งหมด</span>
                        </div>
                    </div>

                    {/* In Progress Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start">
                            <div>
                                <dt className="text-sm font-medium text-gray-500 truncate">กำลังดำเนินการ</dt>
                                <dd className="mt-2 text-3xl font-bold text-yellow-600 font-display">{inProgress}</dd>
                            </div>
                            <div className="p-2 bg-yellow-50 rounded-lg group-hover:bg-yellow-100 transition-colors">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-yellow-600 font-medium">
                            <span className="bg-yellow-50 px-2 py-1 rounded-md">{((inProgress / (filteredProjects.length || 1)) * 100).toFixed(0)}% ของทั้งหมด</span>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 font-display">ความคืบหน้าโครงการ</h3>
                        </div>
                        <div className="h-64">
                            {dataWithDates.length > 0 ? (
                                <Bar data={chartData} options={chartOptions} />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-xl">
                                    <span>ยังไม่มีข้อมูลวันที่โครงการที่ถูกต้อง</span>
                                    <span className="text-xs mt-1">กรุณากรอก Start/End Date ในรูปแบบ DD/MM/YYYY</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Alerts */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 font-display mb-4">การแจ้งเตือน</h3>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <span className="h-2 w-2 mt-2 rounded-full bg-red-500 mr-2"></span>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">ส่งรายงานประจำเดือน</p>
                                    <p className="text-xs text-gray-500">ภายในวันที่ 25 ม.ค.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-sm border border-indigo-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 font-display mb-4">การดำเนินการด่วน</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a
                            href="/dashboard/projects"
                            className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                        >
                            <svg className="w-8 h-8 text-indigo-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <div>
                                <div className="text-sm font-semibold text-gray-900">โครงการของฉัน</div>
                                <div className="text-xs text-gray-500">ดูและจัดการโครงการ</div>
                            </div>
                        </a>
                        <a
                            href="/dashboard/reports"
                            className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                        >
                            <svg className="w-8 h-8 text-purple-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                                <div className="text-sm font-semibold text-gray-900">รายงานผล</div>
                                <div className="text-xs text-gray-500">วิเคราะห์และสรุปข้อมูล</div>
                            </div>
                        </a>
                        <a
                            href="/profile"
                            className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                        >
                            <svg className="w-8 h-8 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <div>
                                <div className="text-sm font-semibold text-gray-900">โปรไฟล์</div>
                                <div className="text-xs text-gray-500">จัดการข้อมูลส่วนตัว</div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
