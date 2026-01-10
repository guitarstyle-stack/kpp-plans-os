'use client';

import { Project } from '@/lib/types';
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
}

export default function DashboardCharts({ projects }: DashboardChartsProps) {
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
                <h3 className="text-lg font-semibold text-gray-900 mb-6">สถานะโครงการ</h3>
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
        </div>
    );
}
