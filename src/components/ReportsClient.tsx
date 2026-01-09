'use client';

import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Project } from '@/lib/types';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Department {
    id: string;
    name: string;
}

export default function ReportsClient() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [selectedYear, setSelectedYear] = useState<string | 'all'>('all');
    const [selectedDepartment, setSelectedDepartment] = useState<string | 'all'>('all');

    useEffect(() => {
        setIsMounted(true);
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [projectsRes, deptRes] = await Promise.all([
                fetch('/api/projects'),
                fetch('/api/departments')
            ]);

            if (projectsRes.ok && deptRes.ok) {
                const projectsData = await projectsRes.json();
                const deptData = await deptRes.json();
                setProjects(projectsData);
                setDepartments(deptData);
            }
        } catch (error) {
            toast.error('ไม่สามารถโหลดข้อมูลได้');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getProjectYear = (p: Project) => {
        if (p.fiscal_year) return p.fiscal_year;
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
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const fiscalYearAD = month >= 10 ? year + 1 : year;
            return (fiscalYearAD + 543).toString();
        } catch (e) {
            return null;
        }
    };

    // Filter projects
    const filteredProjects = projects.filter(p => {
        const yearMatch = selectedYear === 'all' || getProjectYear(p) === selectedYear;
        const deptMatch = selectedDepartment === 'all' || p.agency === selectedDepartment;
        return yearMatch && deptMatch;
    });

    // Available years
    const availableYears = Array.from(new Set(
        projects.map(p => getProjectYear(p)).filter(y => y !== null)
    )).sort((a, b) => parseInt(b as string) - parseInt(a as string));

    // Statistics
    const totalBudget = filteredProjects.reduce((sum, p) => sum + (parseFloat(p.budget.replace(/,/g, '')) || 0), 0);
    const totalProjects = filteredProjects.length;
    const completedProjects = filteredProjects.filter(p => p.status === 'Completed' || p.status === 'ดำเนินการแล้วเสร็จ').length;
    const inProgressProjects = filteredProjects.filter(p => p.status === 'In Progress' || p.status === 'อยู่ระหว่างดำเนินการ' || p.status === 'กำลังดำเนินการ').length;
    const notStartedProjects = filteredProjects.filter(p => p.status === 'Not Started' || p.status === 'ยังไม่เริ่ม').length;

    // Budget by Department
    const budgetByDept = departments.map(dept => {
        const deptProjects = filteredProjects.filter(p => p.agency === dept.name);
        const budget = deptProjects.reduce((sum, p) => sum + (parseFloat(p.budget.replace(/,/g, '')) || 0), 0);
        return { name: dept.name, budget, count: deptProjects.length };
    }).filter(d => d.count > 0);

    // Status Distribution Chart Data
    const statusChartData = {
        labels: ['ดำเนินการแล้วเสร็จ', 'กำลังดำเนินการ', 'ยังไม่เริ่ม'],
        datasets: [{
            data: [completedProjects, inProgressProjects, notStartedProjects],
            backgroundColor: ['#10b981', '#f59e0b', '#6b7280'],
            borderWidth: 0
        }]
    };

    // Budget by Department Chart Data
    const budgetChartData = {
        labels: budgetByDept.map(d => d.name),
        datasets: [{
            label: 'งบประมาณ (บาท)',
            data: budgetByDept.map(d => d.budget),
            backgroundColor: '#6366f1',
            borderRadius: 8
        }]
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading || !isMounted) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">รายงานผล</h1>
                    <p className="text-gray-600 mt-1">สรุปและวิเคราะห์ข้อมูลโครงการ</p>
                </div>
                <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    พิมพ์รายงาน
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 print:hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ปีงบประมาณ</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="all">ทั้งหมด</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">หน่วยงาน</label>
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="all">ทั้งหมด</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.name}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                    <h3 className="text-sm font-medium text-gray-500">งบประมาณรวม</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalBudget)}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
                    <h3 className="text-sm font-medium text-gray-500">โครงการทั้งหมด</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{totalProjects}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                    <h3 className="text-sm font-medium text-gray-500">เสร็จสิ้นแล้ว</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{completedProjects}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
                    <h3 className="text-sm font-medium text-gray-500">กำลังดำเนินการ</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{inProgressProjects}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">สถานะโครงการ</h3>
                    <div className="h-64 flex items-center justify-center">
                        <Pie data={statusChartData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">งบประมาณตามหน่วยงาน</h3>
                    <div className="h-64">
                        <Bar
                            data={budgetChartData}
                            options={{
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            callback: (value) => formatCurrency(value as number)
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Department Summary Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">สรุปตามหน่วยงาน</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">หน่วยงาน</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">จำนวนโครงการ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">งบประมาณ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เสร็จสิ้น</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">กำลังดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {budgetByDept.map((dept, idx) => {
                                const deptProjects = filteredProjects.filter(p => p.agency === dept.name);
                                const completed = deptProjects.filter(p => p.status === 'Completed' || p.status === 'ดำเนินการแล้วเสร็จ').length;
                                const inProgress = deptProjects.filter(p => p.status === 'In Progress' || p.status === 'อยู่ระหว่างดำเนินการ' || p.status === 'กำลังดำเนินการ').length;

                                return (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{dept.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{dept.count}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(dept.budget)}</td>
                                        <td className="px-6 py-4 text-sm text-green-600 font-medium">{completed}</td>
                                        <td className="px-6 py-4 text-sm text-orange-600 font-medium">{inProgress}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
