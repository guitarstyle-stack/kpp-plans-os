
'use client';

import { useState, useEffect } from 'react';
import { StrategicPlan, StrategicGoal, StrategicIndicator } from '@/lib/types';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';

export default function AdminCategoriesClient() {
    const [years, setYears] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear() + 543 + '');

    // Data State
    const [plans, setPlans] = useState<StrategicPlan[]>([]);
    const [goals, setGoals] = useState<StrategicGoal[]>([]);
    const [indicators, setIndicators] = useState<StrategicIndicator[]>([]);

    // Selection State
    const [selectedPlan, setSelectedPlan] = useState<StrategicPlan | null>(null);
    const [selectedGoal, setSelectedGoal] = useState<StrategicGoal | null>(null);

    // Edit State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<{ type: 'plan' | 'goal' | 'indicator', id: string, name: string, description: string } | null>(null);
    const [descriptionInput, setDescriptionInput] = useState('');

    // Load Plans for Year
    useEffect(() => {
        fetchPlans(selectedYear);
    }, [selectedYear]);

    // Load Goals when Plan Selected
    useEffect(() => {
        if (selectedPlan) {
            fetchGoals(selectedPlan.id);
            setGoals([]);
            setIndicators([]);
            setSelectedGoal(null);
        } else {
            setGoals([]);
            setIndicators([]);
        }
    }, [selectedPlan]);

    // Load Indicators when Goal Selected
    useEffect(() => {
        if (selectedGoal) {
            fetchIndicators(selectedGoal.id);
        } else {
            setIndicators([]);
        }
    }, [selectedGoal]);

    const fetchPlans = async (year: string) => {
        try {
            const res = await fetch(`/api/strategic-plans?fiscalYear=${year}`);
            if (res.ok) setPlans(await res.json());
        } catch (error) {
            toast.error('โหลดข้อมูลแผนไม่สำเร็จ');
        }
    };

    const fetchGoals = async (planId: string) => {
        try {
            const res = await fetch(`/api/strategic-goals?planId=${planId}`);
            if (res.ok) setGoals(await res.json());
        } catch (error) {
            toast.error('โหลดเป้าหมายไม่สำเร็จ');
        }
    };

    const fetchIndicators = async (goalId: string) => {
        try {
            const res = await fetch(`/api/strategic-indicators?goalId=${goalId}`);
            if (res.ok) setIndicators(await res.json());
        } catch (error) {
            toast.error('โหลดตัวชี้วัดไม่สำเร็จ');
        }
    };

    const openEditModal = (item: any, type: 'plan' | 'goal' | 'indicator') => {
        setEditingItem({
            type,
            id: item.id,
            name: item.name,
            description: item.description || ''
        });
        setDescriptionInput(item.description || '');
        setEditModalOpen(true);
    };

    const handleSaveDescription = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        let url = '';
        let body: any = { id: editingItem.id, description: descriptionInput };

        if (editingItem.type === 'plan') url = '/api/strategic-plans';
        if (editingItem.type === 'goal') url = '/api/strategic-goals';
        if (editingItem.type === 'indicator') url = '/api/strategic-indicators';

        // Preserve required fields just in case PUT replacement requires them (though our service usually merges)
        // types.ts says description is optional partial. Service uses row.assign merged. So safe.

        try {
            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                toast.success('บันทึกรายละเอียดสำเร็จ');
                setEditModalOpen(false);
                // Refresh data
                if (editingItem.type === 'plan') fetchPlans(selectedYear);
                if (editingItem.type === 'goal' && selectedPlan) fetchGoals(selectedPlan.id);
                if (editingItem.type === 'indicator' && selectedGoal) fetchIndicators(selectedGoal.id);
            } else {
                toast.error('บันทึกไม่สำเร็จ');
            }
        } catch (error) {
            toast.error('เกิดข้อผิดพลาดในการบันทึก');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">จัดการรายละเอียดแผน</h2>
                    <p className="text-sm text-gray-500 mt-1">เพิ่มรายละเอียด, วัตถุประสงค์, และตัวชี้วัด ให้กับโครงสร้างแผนงาน</p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">ปีงบประมาณ:</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="border-gray-300 rounded-md shadow-sm text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        {[...Array(5)].map((_, i) => {
                            const year = new Date().getFullYear() + 543 - 2 + i;
                            return <option key={year} value={year}>{year}</option>;
                        })}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
                {/* Column 1: Development Guideline */}
                <div className="bg-white rounded-lg shadow-sm flex flex-col border border-gray-200">
                    <div className="p-4 border-b border-gray-100 bg-indigo-50 rounded-t-lg">
                        <h3 className="font-bold text-gray-800">1. แผนพัฒนารายประเด็น (Guideline)</h3>
                        <span className="text-xs text-indigo-600 mt-1 block">เลือกแผนเพื่อแก้ไขรายละเอียด</span>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {plans.map(plan => (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan)}
                                className={`p-3 rounded-lg cursor-pointer border transition-all relative group ${selectedPlan?.id === plan.id ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}
                            >
                                <div className="pr-8">
                                    <p className="text-sm font-medium text-gray-900">{plan.name}</p>
                                    {plan.description && (
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{plan.description}</p>
                                    )}
                                    {!plan.description && (
                                        <p className="text-xs text-gray-300 mt-1 italic">ไม่มีรายละเอียด</p>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); openEditModal(plan, 'plan'); }}
                                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                    title="แก้ไขรายละเอียด"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column 2: Objective */}
                <div className={`bg-white rounded-lg shadow-sm flex flex-col border border-gray-200 ${!selectedPlan ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="p-4 border-b border-gray-100 bg-purple-50 rounded-t-lg">
                        <h3 className="font-bold text-gray-800">2. เป้าหมาย (Objective)</h3>
                        <span className="text-xs text-purple-600 mt-1 block">เลือกเป้าหมายเพื่อแก้ไขรายละเอียด</span>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {goals.map(goal => (
                            <div
                                key={goal.id}
                                onClick={() => setSelectedGoal(goal)}
                                className={`p-3 rounded-lg cursor-pointer border transition-all relative group ${selectedGoal?.id === goal.id ? 'bg-purple-50 border-purple-500 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}
                            >
                                <div className="pr-8">
                                    <p className="text-sm font-medium text-gray-900">{goal.name}</p>
                                    {goal.description && (
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{goal.description}</p>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); openEditModal(goal, 'goal'); }}
                                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-purple-600 hover:bg-white rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                    title="แก้ไขรายละเอียด"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        {selectedPlan && goals.length === 0 && <p className="text-center text-gray-400 text-sm mt-4">ยังไม่มีเป้าหมาย</p>}
                    </div>
                </div>

                {/* Column 3: Indicator */}
                <div className={`bg-white rounded-lg shadow-sm flex flex-col border border-gray-200 ${!selectedGoal ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="p-4 border-b border-gray-100 bg-teal-50 rounded-t-lg">
                        <h3 className="font-bold text-gray-800">3. ตัวชี้วัด (Indicator)</h3>
                        <span className="text-xs text-teal-600 mt-1 block">แก้ไขตัวชี้วัด</span>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {indicators.map(ind => (
                            <div
                                key={ind.id}
                                className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all relative group"
                            >
                                <div className="pr-8">
                                    <p className="text-sm font-medium text-gray-900">{ind.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">เป้า: {ind.recommended_target} {ind.unit}</p>
                                    {ind.description && (
                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                            <p className="text-xs text-gray-600">{ind.description}</p>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); openEditModal(ind, 'indicator'); }}
                                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-teal-600 hover:bg-white rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                    title="แก้ไขรายละเอียด"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        {selectedGoal && indicators.length === 0 && <p className="text-center text-gray-400 text-sm mt-4">ยังไม่มีตัวชี้วัด</p>}
                    </div>
                </div>
            </div>

            <Modal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title={`แก้ไขรายละเอียด: ${editingItem?.name}`}
            >
                <form onSubmit={handleSaveDescription} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดเพิ่มเติม (Description)</label>
                        <textarea
                            value={descriptionInput}
                            onChange={(e) => setDescriptionInput(e.target.value)}
                            className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[150px]"
                            placeholder="ระบุรายละเอียด..."
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setEditModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm"
                        >
                            บันทึก
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
