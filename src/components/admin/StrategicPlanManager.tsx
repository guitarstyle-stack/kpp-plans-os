
'use client';

import { useState, useEffect } from 'react';
import { StrategicPlan, StrategicGoal, StrategicIndicator } from '@/lib/types';
import toast from 'react-hot-toast';

export default function StrategicPlanManager() {
    const [years, setYears] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear() + 543 + '');

    // Data State
    const [plans, setPlans] = useState<StrategicPlan[]>([]);
    const [goals, setGoals] = useState<StrategicGoal[]>([]);
    const [indicators, setIndicators] = useState<StrategicIndicator[]>([]);

    // Selection State
    const [selectedPlan, setSelectedPlan] = useState<StrategicPlan | null>(null);
    const [selectedGoal, setSelectedGoal] = useState<StrategicGoal | null>(null);

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

    // --- Fetching Logic ---

    const fetchPlans = async (year: string) => {
        try {
            const res = await fetch(`/api/strategic-plans?fiscalYear=${year}`);
            if (res.ok) setPlans(await res.json());
        } catch (error) {
            console.error(error);
            toast.error('โหลดแผนพัฒนารายประเด็นไม่สำเร็จ');
        }
    };

    const fetchGoals = async (planId: string) => {
        try {
            const res = await fetch(`/api/strategic-goals?planId=${planId}`);
            if (res.ok) setGoals(await res.json());
        } catch (error) {
            console.error(error);
            toast.error('โหลดเป้าหมายไม่สำเร็จ');
        }
    };

    const fetchIndicators = async (goalId: string) => {
        try {
            const res = await fetch(`/api/strategic-indicators?goalId=${goalId}`);
            if (res.ok) setIndicators(await res.json());
        } catch (error) {
            console.error(error);
            toast.error('โหลดตัวชี้วัดไม่สำเร็จ');
        }
    };

    // --- Handlers (Simplified for MVP, ideally modals) ---

    // Plan Handlers
    const handleAddPlan = async () => {
        const name = prompt('ชื่อแผนพัฒนารายประเด็น / แนวทางการพัฒนา:');
        if (!name) return;

        try {
            const res = await fetch('/api/strategic-plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, fiscal_year: selectedYear })
            });
            if (res.ok) {
                toast.success('เพิ่มแผนสำเร็จ');
                fetchPlans(selectedYear);
            }
        } catch (error) {
            toast.error('เพิ่มแผนไม่สำเร็จ');
        }
    };

    const handleDeletePlan = async (id: string) => {
        if (!confirm('ยืนยันการลบแผนนี้? ข้อมูลเป้าหมายและตัวชี้วัดภายในจะหายไปหรือไม่สามารถเข้าถึงได้')) return;

        try {
            const res = await fetch(`/api/strategic-plans?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('ลบแผนสำเร็จ');
                fetchPlans(selectedYear);
                if (selectedPlan?.id === id) setSelectedPlan(null);
            }
        } catch (error) {
            toast.error('ลบแผนไม่สำเร็จ');
        }
    };

    // Goal Handlers
    const handleAddGoal = async () => {
        if (!selectedPlan) return;
        const name = prompt('ชื่อเป้าหมาย / วัตถุประสงค์:');
        if (!name) return;

        try {
            const res = await fetch('/api/strategic-goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, planId: selectedPlan.id })
            });
            if (res.ok) {
                toast.success('เพิ่มเป้าหมายสำเร็จ');
                fetchGoals(selectedPlan.id);
            }
        } catch (error) {
            toast.error('เพิ่มเป้าหมายไม่สำเร็จ');
        }
    };

    const handleDeleteGoal = async (id: string) => {
        if (!confirm('ยืนยันการลบเป้าหมายนี้?')) return;

        try {
            const res = await fetch(`/api/strategic-goals?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('ลบเป้าหมายสำเร็จ');
                fetchGoals(selectedPlan!.id);
                if (selectedGoal?.id === id) setSelectedGoal(null);
            }
        } catch (error) {
            toast.error('ลบเป้าหมายไม่สำเร็จ');
        }
    };

    // Indicator Handlers
    const handleAddIndicator = async () => {
        if (!selectedGoal) return;
        const name = prompt('ชื่อตัวชี้วัด:');
        if (!name) return;
        const unit = prompt('หน่วยนับ:', 'ร้อยละ') || '';
        const target = prompt('ค่าเป้าหมาย (แนะนำ):', '100') || '';

        try {
            const res = await fetch('/api/strategic-indicators', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, unit, recommended_target: target, goalId: selectedGoal.id })
            });
            if (res.ok) {
                toast.success('เพิ่มตัวชี้วัดสำเร็จ');
                fetchIndicators(selectedGoal.id);
            }
        } catch (error) {
            toast.error('เพิ่มตัวชี้วัดไม่สำเร็จ');
        }
    };

    const handleDeleteIndicator = async (id: string) => {
        if (!confirm('ยืนยันการลบตัวชี้วัดนี้?')) return;

        try {
            const res = await fetch(`/api/strategic-indicators?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('ลบตัวชี้วัดสำเร็จ');
                fetchIndicators(selectedGoal!.id);
            }
        } catch (error) {
            toast.error('ลบตัวชี้วัดไม่สำเร็จ');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                <label className="font-semibold text-gray-700">ปีงบประมาณ:</label>
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="border rounded px-3 py-1 w-32 text-center"
                >
                    {[...Array(5)].map((_, i) => {
                        const year = new Date().getFullYear() + 543 - 2 + i;
                        return <option key={year} value={year}>{year}</option>;
                    })}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
                {/* Column 1: Strategic Plans */}
                <div className="bg-white rounded-lg shadow-sm flex flex-col border border-gray-200">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
                        <h3 className="font-bold text-gray-800">1. แผนพัฒนารายประเด็น (Development Guideline)</h3>
                        <button onClick={handleAddPlan} className="text-sm bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700">
                            + เพิ่ม
                        </button>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {plans.map(plan => (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan)}
                                className={`p-3 rounded-lg cursor-pointer border transition-all ${selectedPlan?.id === plan.id ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-medium text-gray-900">{plan.name}</p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id); }}
                                        className="text-xs text-red-400 hover:text-red-600 ml-2"
                                    >
                                        ลบ
                                    </button>
                                </div>
                            </div>
                        ))}
                        {plans.length === 0 && <p className="text-center text-gray-400 text-sm mt-4">ยังไม่มีข้อมูล</p>}
                    </div>
                </div>

                {/* Column 2: Goals */}
                <div className={`bg-white rounded-lg shadow-sm flex flex-col border border-gray-200 ${!selectedPlan ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
                        <h3 className="font-bold text-gray-800">2. เป้าหมาย (Objective)</h3>
                        {selectedPlan && (
                            <button onClick={handleAddGoal} className="text-sm bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700">
                                + เพิ่ม
                            </button>
                        )}
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {goals.map(goal => (
                            <div
                                key={goal.id}
                                onClick={() => setSelectedGoal(goal)}
                                className={`p-3 rounded-lg cursor-pointer border transition-all ${selectedGoal?.id === goal.id ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-medium text-gray-900">{goal.name}</p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteGoal(goal.id); }}
                                        className="text-xs text-red-400 hover:text-red-600 ml-2"
                                    >
                                        ลบ
                                    </button>
                                </div>
                            </div>
                        ))}
                        {selectedPlan && goals.length === 0 && <p className="text-center text-gray-400 text-sm mt-4">ยังไม่มีข้อมูล</p>}
                        {!selectedPlan && <p className="text-center text-gray-400 text-sm mt-4">กรุณาเลือกแผนพัฒนารายประเด็นก่อน</p>}
                    </div>
                </div>

                {/* Column 3: Indicators */}
                <div className={`bg-white rounded-lg shadow-sm flex flex-col border border-gray-200 ${!selectedGoal ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
                        <h3 className="font-bold text-gray-800">3. ตัวชี้วัด (Indicator)</h3>
                        {selectedGoal && (
                            <button onClick={handleAddIndicator} className="text-sm bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700">
                                + เพิ่ม
                            </button>
                        )}
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {indicators.map(ind => (
                            <div
                                key={ind.id}
                                className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-900">{ind.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">เป้า: {ind.recommended_target} {ind.unit}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteIndicator(ind.id)}
                                        className="text-xs text-red-400 hover:text-red-600 ml-2"
                                    >
                                        ลบ
                                    </button>
                                </div>
                            </div>
                        ))}
                        {selectedGoal && indicators.length === 0 && <p className="text-center text-gray-400 text-sm mt-4">ยังไม่มีข้อมูล</p>}
                        {!selectedGoal && <p className="text-center text-gray-400 text-sm mt-4">กรุณาเลือกเป้าหมายก่อน</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
