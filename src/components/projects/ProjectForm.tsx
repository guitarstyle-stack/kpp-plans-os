'use client';

import { Project, Indicator, StrategicPlan, StrategicGoal, StrategicIndicator } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import { useState, useEffect } from 'react';

interface ProjectFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: Partial<Project>;
    setFormData: (data: Partial<Project>) => void;
    indicators: Partial<Indicator>[];
    setIndicators: (data: Partial<Indicator>[]) => void;
    isEdit?: boolean;
    masterData: {
        strategicPlans: StrategicPlan[];
        strategicGoals: StrategicGoal[];
        strategicIndicatorsList: StrategicIndicator[];
    };
    onPlanChange?: (planId: string) => void;
    onGoalChange?: (goalId: string) => void;
    onIndicatorSelect?: (indId: string) => void;
}

export default function ProjectForm({
    isOpen,
    onClose,
    onSubmit,
    formData,
    setFormData,
    indicators,
    setIndicators,
    isEdit = false,
    masterData,
    onPlanChange,
    onGoalChange,
    onIndicatorSelect
}: ProjectFormProps) {

    const { strategicPlans, strategicGoals, strategicIndicatorsList } = masterData;

    const addIndicatorRow = () => {
        setIndicators([...indicators, { name: '', target: '', unit: '', id: '' }]);
    };

    const removeIndicatorRow = (index: number) => {
        const newIndicators = [...indicators];
        newIndicators.splice(index, 1);
        setIndicators(newIndicators);
    };

    const handleIndicatorChange = (index: number, field: keyof Indicator, value: string) => {
        const newIndicators = [...indicators];
        newIndicators[index] = { ...newIndicators[index], [field]: value };
        setIndicators(newIndicators);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? "แก้ไขโครงการ" : "สร้างโครงการใหม่"}
            maxWidth="max-w-2xl"
        >
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ปีงบประมาณ</label>
                        <select
                            required
                            value={formData.fiscal_year || ''}
                            onChange={(e) => setFormData({ ...formData, fiscal_year: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
                        >
                            {[...Array(5)].map((_, i) => {
                                const year = new Date().getFullYear() + 543 - 2 + i;
                                return <option key={year} value={year}>{year}</option>;
                            })}
                        </select>
                    </div>

                    {/* Master Data Section - Grouped */}
                    <div className="col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b text-indigo-600 pb-1">ข้อมูลแผนพัฒนารายประเด็น (Master Data)</h3>

                        {/* 1. Development Guideline (Strategic Plan) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">เลือกแผนพัฒนารายประเด็น</label>
                            <select
                                value={formData.strategicPlanId || ''}
                                onChange={(e) => onPlanChange && onPlanChange(e.target.value)}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm mb-2"
                            >
                                <option value="">-- เลือกแผน --</option>
                                {strategicPlans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <label className="block text-xs text-gray-500 text-right">แนวทางการพัฒนา (ระบบเติมให้อัตโนมัติ)</label>
                            <textarea
                                rows={2}
                                value={formData.development_guideline || ''}
                                onChange={(e) => setFormData({ ...formData, development_guideline: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
                            />
                        </div>

                        {/* 2. Objective (Strategic Goal) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">เลือกเป้าหมาย</label>
                            <select
                                value={formData.strategicGoalId || ''}
                                onChange={(e) => onGoalChange && onGoalChange(e.target.value)}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm mb-2"
                                disabled={!formData.strategicPlanId}
                            >
                                <option value="">-- เลือกเป้าหมาย --</option>
                                {strategicGoals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                            <label className="block text-xs text-gray-500 text-right">วัตถุประสงค์ (ระบบเติมให้อัตโนมัติ)</label>
                            <textarea
                                rows={3}
                                value={formData.objective || ''}
                                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
                            />
                        </div>

                        {/* 3. Governance Indicator */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เลือกตัวชี้วัดจากแผน (Optional)</label>
                            <select
                                onChange={(e) => onIndicatorSelect && onIndicatorSelect(e.target.value)}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm mb-2"
                                disabled={!formData.strategicGoalId}
                                value=""
                            >
                                <option value="">-- เลือกเพื่อนำเข้าข้อมูล --</option>
                                {strategicIndicatorsList.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                            <label className="block text-xs text-gray-500 text-right">ตัวชี้วัดกำกับ (ระบบเติมให้อัตโนมัติ)</label>
                            <textarea
                                rows={2}
                                value={formData.governance_indicator || ''}
                                onChange={(e) => setFormData({ ...formData, governance_indicator: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
                            />
                        </div>
                        <div className="mt-2 text-right">
                            <label className="block text-xs text-gray-500">ค่าเป้าหมายรายปี (Annual Target)</label>
                            <input
                                type="text"
                                value={formData.annual_target || ''}
                                onChange={(e) => setFormData({ ...formData, annual_target: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1 text-sm shadow-sm"
                                placeholder="ค่าเป้าหมาย"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">ชื่อโครงการ</label>
                        <input
                            type="text"
                            required
                            value={formData.project_name || formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, project_name: e.target.value, name: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">หน่วยงานรับผิดชอบ (หลัก)</label>
                        <input
                            type="text"
                            value={formData.agency || ''}
                            disabled
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 sm:text-sm"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">หน่วยงานสนับสนุน (ถ้ามี)</label>
                        <input
                            type="text"
                            value={formData.support_agency || ''}
                            onChange={(e) => setFormData({ ...formData, support_agency: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-600 sm:text-sm"
                            placeholder="ระบุหน่วยงานสนับสนุน"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">งบประมาณ (บาท)</label>
                        <input
                            type="number"
                            required
                            value={formData.budget || ''}
                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">แหล่งงบประมาณ</label>
                        <input
                            type="text"
                            value={formData.source || ''}
                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">กลุ่มเป้าหมาย (Target Group)</label>
                        <input
                            type="text"
                            value={formData.target_group || ''}
                            onChange={(e) => setFormData({ ...formData, target_group: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-600 sm:text-sm"
                            placeholder="เช่น เกษตรกร, นักเรียน"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">จำนวนกลุ่มเป้าหมาย</label>
                        <input
                            type="text"
                            value={formData.target_group_amount || ''}
                            onChange={(e) => setFormData({ ...formData, target_group_amount: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-600 sm:text-sm"
                            placeholder="เช่น 100 คน, 50 ครัวเรือน"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">วันที่เริ่มต้น</label>
                        <input
                            type="date"
                            required
                            value={formData.start_date || ''}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">วันที่สิ้นสุด</label>
                        <input
                            type="date"
                            required
                            value={formData.end_date || ''}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">ผู้รับผิดชอบโครงการ</label>
                        <input
                            type="text"
                            value={formData.responsible_person || ''}
                            onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
                        />
                    </div>
                </div>

                {/* Indicators Section */}
                <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">ตัวชี้วัดโครงการ (Project Indicators)</label>
                        <button
                            type="button"
                            onClick={addIndicatorRow}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            + เพิ่มตัวชี้วัด
                        </button>
                    </div>

                    {indicators.map((ind, index) => (
                        <div key={index} className="flex gap-2 mb-2 items-start">
                            <div className="flex-grow grid grid-cols-12 gap-2">
                                <div className="col-span-6">
                                    <input
                                        type="text"
                                        placeholder="ชื่อตัวชี้วัด"
                                        value={ind.name}
                                        onChange={(e) => handleIndicatorChange(index, 'name', e.target.value)}
                                        className="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm"
                                        required
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="text"
                                        placeholder="เป้าหมาย"
                                        value={ind.target}
                                        onChange={(e) => handleIndicatorChange(index, 'target', e.target.value)}
                                        className="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm"
                                        required
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="text"
                                        placeholder="หน่วยนับ"
                                        value={ind.unit}
                                        onChange={(e) => handleIndicatorChange(index, 'unit', e.target.value)}
                                        className="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeIndicatorRow(index)}
                                className="text-red-500 hover:text-red-700 text-lg leading-none p-1"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                    {indicators.length === 0 && (
                        <p className="text-xs text-gray-500 italic">ยังไม่มีตัวชี้วัด</p>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        ยกเลิก
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        {isEdit ? 'บันทึกการแก้ไข' : 'สร้างโครงการ'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
