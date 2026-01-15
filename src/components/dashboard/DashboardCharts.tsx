'use client';

import { Project, StrategicPlan } from '@/lib/types';
import { useMemo } from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

interface DashboardChartsProps {
    projects: Project[];
    plans?: StrategicPlan[];
}

export default function DashboardCharts({ projects, plans = [] }: DashboardChartsProps) {
    // 1. Status Distribution (Pie Chart)
    const statusData = useMemo(() => {
        const statusMap: Record<string, number> = {};
        projects.forEach(p => {
            const status = p.status || 'Unknown';
            statusMap[status] = (statusMap[status] || 0) + 1;
        });

        return {
            labels: Object.keys(statusMap),
            datasets: [
                {
                    data: Object.values(statusMap),
                    backgroundColor: [
                        '#4F46E5', // Indigo
                        '#10B981', // Green
                        '#F59E0B', // Amber
                        '#EF4444', // Red
                        '#6B7280', // Gray
                    ],
                    borderWidth: 1,
                },
            ],
        };
    }, [projects]);

    // 2. Budget by Agency (Bar Chart) - Top 5
    const budgetData = useMemo(() => {
        const agencyMap: Record<string, number> = {};
        projects.forEach(p => {
            const agency = p.agency || 'Unassigned';
            const cleanBudget = parseFloat(p.budget.replace(/,/g, '')) || 0;
            agencyMap[agency] = (agencyMap[agency] || 0) + cleanBudget;
        });

        const sortedAgencies = Object.entries(agencyMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        return {
            labels: sortedAgencies.map(([agency]) => agency),
            datasets: [
                {
                    label: 'งบประมาณ (บาท)',
                    data: sortedAgencies.map(([, budget]) => budget),
                    backgroundColor: '#8B5CF6', // Purple
                },
            ],
        };
    }, [projects]);

    // 3. Status by Master Plan (Stacked Bar)
    const planStatusData = useMemo(() => {
        // If no plans loaded or passed, skip/return empty safe
        if (plans.length === 0) return null;

        // Labels = Plan Names
        const labels = plans.map(p => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name);

        // Datasets = Statuses (Completed, In Progress, etc.)
        const statuses = ['Completed', 'In Progress', 'Not Started', 'Delayed'];
        const statusColors = ['#10B981', '#F59E0B', '#6B7280', '#EF4444'];
        const statusLabels = ['ดำเนินการเสร็จสิ้น', 'กำลังดำเนินการ', 'ยังไม่ดำเนินการ', 'ล่าช้า'];

        const datasets = statuses.map((status, index) => {
            const data = plans.map(plan => {
                // Count projects with this status for this plan
                return projects.filter(p =>
                    p.strategicPlanId === plan.id &&
                    (p.status === status || (status === 'Not Started' && p.status === 'ยังไม่ดำเนินการ') || (status === 'Completed' && p.status === 'ดำเนินการแล้วเสร็จ') || (status === 'In Progress' && p.status === 'กำลังดำเนินการ'))
                ).length;
            });

            return {
                label: statusLabels[index],
                data: data,
                backgroundColor: statusColors[index],
                stack: 'Stack 0',
            };
        });

        return {
            labels,
            datasets
        };
    }, [projects, plans]);

    const pieOptions = {
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 12 }
                }
            }
        },
        maintainAspectRatio: false
    };

    const barOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value: string | number) {
                        const val = Number(value);
                        if (val >= 1000000) return (val / 1000000) + 'M';
                        if (val >= 1000) return (val / 1000) + 'K';
                        return val;
                    }
                }
            }
        },
        maintainAspectRatio: false
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Status Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">สถานะโครงการ (ภาพรวม)</h3>
                <div className="h-64 flex justify-center">
                    <Pie data={statusData} options={pieOptions} />
                </div>
            </div>

            {/* Budget Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">งบประมาณตามหน่วยงาน (Top 5)</h3>
                <div className="h-64">
                    <Bar data={budgetData} options={barOptions} />
                </div>
            </div>

            {/* NEW: Status by Master Plan */}
            {planStatusData && (
                <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">สถานะโครงการ แยกตามแผนพัฒนารายประเด็น</h3>
                    <div className="h-80">
                        <Bar data={planStatusData} options={{
                            ...barOptions,
                            plugins: { ...barOptions.plugins, legend: { display: true, position: 'bottom' } },
                            scales: { ...barOptions.scales, x: { stacked: true }, y: { stacked: true, beginAtZero: true, ticks: { callback: (val) => val } } }
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
}
