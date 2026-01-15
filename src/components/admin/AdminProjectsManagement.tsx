'use client';

import { useState, useEffect } from 'react';
import { Project, Indicator, StrategicPlan, StrategicGoal, StrategicIndicator } from '@/lib/types';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import ConfirmationModal from '../ui/ConfirmationModal';

interface Department {
    id: string;
    name: string;
}

export default function AdminProjectsManagement() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [formData, setFormData] = useState<Partial<Project>>({});

    // Indicator State
    const [indicators, setIndicators] = useState<Partial<Indicator>[]>([]);

    // Master Data State
    const [strategicPlans, setStrategicPlans] = useState<StrategicPlan[]>([]);
    const [strategicGoals, setStrategicGoals] = useState<StrategicGoal[]>([]);
    const [strategicIndicatorsList, setStrategicIndicatorsList] = useState<StrategicIndicator[]>([]);

    useEffect(() => {
        if (showCreateModal && formData.fiscal_year) {
            fetchStrategicPlans(formData.fiscal_year);
        }
    }, [showCreateModal, formData.fiscal_year]);

    const fetchStrategicPlans = async (year: string) => {
        try {
            const res = await fetch(`/api/strategic-plans?fiscalYear=${year}`);
            if (res.ok) setStrategicPlans(await res.json());
        } catch (error) { console.error(error); }
    };

    const handlePlanChange = async (planId: string) => {
        const plan = strategicPlans.find(p => p.id === planId);
        setFormData(prev => ({
            ...prev,
            strategicPlanId: planId,
            development_guideline: plan?.name || '',
            strategicGoalId: '', // Reset lower levels
            objective: ''
        }));
        setStrategicGoals([]);
        setStrategicIndicatorsList([]);

        if (planId) {
            try {
                const res = await fetch(`/api/strategic-goals?planId=${planId}`);
                if (res.ok) setStrategicGoals(await res.json());
            } catch (error) { console.error(error); }
        }
    };

    const handleGoalChange = async (goalId: string) => {
        const goal = strategicGoals.find(g => g.id === goalId);
        setFormData(prev => ({
            ...prev,
            strategicGoalId: goalId,
            objective: goal?.name || ''
        }));
        setStrategicIndicatorsList([]);

        if (goalId) {
            try {
                const res = await fetch(`/api/strategic-indicators?goalId=${goalId}`);
                if (res.ok) setStrategicIndicatorsList(await res.json());
            } catch (error) { console.error(error); }
        }
    };

    const handleStrategicIndicatorSelect = (indId: string) => {
        const ind = strategicIndicatorsList.find(i => i.id === indId);
        if (ind) {
            setFormData(prev => ({
                ...prev,
                governance_indicator: ind.name,
                annual_target: ind.recommended_target || prev.annual_target,
            }));
            // Also add to project indicators if list is empty?
            if (indicators.length === 0) {
                setIndicators([{
                    name: ind.name,
                    target: ind.recommended_target || '',
                    unit: ind.unit || ''
                }]);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Use batched endpoint to reduce API calls
            const res = await fetch('/api/batch/admin-projects');

            if (res.ok) {
                const { projects: projectsData, departments: deptData } = await res.json();
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

    const handleCreate = () => {
        setFormData({
            project_name: '',
            agency: '',
            budget: '0',
            source: '',
            target_group: '',
            target_group_amount: '',
            start_date: '',
            end_date: '',
            status: 'ยังไม่ดำเนินการ',
            progress: '0',
            fiscal_year: new Date().getFullYear() + 543 + '',
            responsible_person: '',
            description: '',
            development_guideline: '',
            governance_indicator: '',
            annual_target: '',
            objective: '',
            support_agency: ''
        });
        setIndicators([]);
        setShowCreateModal(true);
    };

    const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        // If already in YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

        // Handle DD/MM/YYYY (Thai/UK format)
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        // Handle Date object string or other formats
        try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
        } catch (e) {
            console.error('Invalid date', e);
        }
        return dateString;
    };

    const handleEdit = async (project: Project) => {
        setSelectedProject(project);
        setFormData({
            ...project,
            start_date: formatDateForInput(project.start_date),
            end_date: formatDateForInput(project.end_date)
        });
        setIndicators([]); // Reset first

        // Fetch indicators
        try {
            const res = await fetch(`/api/indicators?projectId=${project.id}`);
            if (res.ok) {
                const data = await res.json();
                setIndicators(data);
            }
        } catch (error) {
            console.error('Failed to load indicators:', error);
            toast.error('ไม่สามารถโหลดตัวชี้วัดได้');
        }

        setShowEditModal(true);
    };

    const handleDelete = (project: Project) => {
        setSelectedProject(project);
        setShowDeleteModal(true);
    };

    // Indicator Handlers
    const addIndicatorRow = () => {
        setIndicators([...indicators, { name: '', target: '', unit: '', id: '' }]);
    };

    const removeIndicatorRow = (index: number) => {
        const newIndicators = [...indicators];
        newIndicators.splice(index, 1);
        setIndicators(newIndicators);
    };

    const updateIndicatorRow = (index: number, field: keyof Indicator, value: string) => {
        const newIndicators = [...indicators];
        newIndicators[index] = { ...newIndicators[index], [field]: value };
        setIndicators(newIndicators);
    };

    const submitCreate = async () => {
        try {
            // 1. Create Project
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const newProject = await res.json();

                // 2. Create Indicators (if any)
                if (indicators.length > 0) {
                    await fetch('/api/indicators', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            projectId: newProject.id, // Use new ID
                            indicators: indicators.filter(i => i.name) // Filter empty
                        })
                    });
                }

                toast.success('สร้างโครงการสำเร็จ');
                setShowCreateModal(false);
                fetchData();
            } else {
                toast.error('ไม่สามารถสร้างโครงการได้');
            }
        } catch (error) {
            toast.error('เกิดข้อผิดพลาด');
            console.error(error);
        }
    };

    const submitEdit = async () => {
        try {
            // 1. Update Project
            const res = await fetch('/api/projects', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedProject?.id, ...formData })
            });

            if (res.ok) {
                // 2. Update Indicators
                await fetch('/api/indicators', {
                    method: 'POST', // Re-using POST for sync update strategy
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        projectId: selectedProject?.id,
                        indicators: indicators.filter(i => i.name)
                    })
                });

                toast.success('อัปเดตโครงการสำเร็จ');
                setShowEditModal(false);
                fetchData();
            } else {
                toast.error('ไม่สามารถอัปเดตโครงการได้');
            }
        } catch (error) {
            toast.error('เกิดข้อผิดพลาด');
            console.error(error);
        }
    };

    const confirmDelete = async () => {
        try {
            const res = await fetch(`/api/projects/${selectedProject?.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success('ลบโครงการสำเร็จ');
                setShowDeleteModal(false);
                fetchData();
            } else {
                toast.error('ไม่สามารถลบโครงการได้');
            }
        } catch (error) {
            toast.error('เกิดข้อผิดพลาด');
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">จัดการโครงการ</h1>
                    <p className="text-gray-600 mt-1">สร้าง แก้ไข และลบโครงการ</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    สร้างโครงการใหม่
                </button>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อโครงการ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">หน่วยงาน</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">งบประมาณ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ความคืบหน้า</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {projects.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        ยังไม่มีโครงการ
                                    </td>
                                </tr>
                            ) : (
                                projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{project.project_name || project.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{project.agency}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{Number(project.budget).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${project.status === 'Completed' || project.status === 'ดำเนินการแล้วเสร็จ'
                                                ? 'bg-green-100 text-green-800'
                                                : project.status === 'In Progress' || project.status === 'กำลังดำเนินการ'
                                                    ? 'bg-orange-100 text-orange-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{project.progress}%</td>
                                        <td className="px-6 py-4 text-sm space-x-2">
                                            <button
                                                onClick={() => handleEdit(project)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                แก้ไข
                                            </button>
                                            <button
                                                onClick={() => handleDelete(project)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                ลบ
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || showEditModal) && (
                <Modal
                    isOpen={showCreateModal || showEditModal}
                    onClose={() => {
                        setShowCreateModal(false);
                        setShowEditModal(false);
                    }}
                    title={showCreateModal ? 'สร้างโครงการใหม่' : 'แก้ไขโครงการ'}
                    maxWidth="max-w-2xl"
                >
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {/* Basic Info */}
                        {/* 0. Fiscal Year - Moved up for hierarchy flow */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ปีงบประมาณ</label>
                            <select
                                value={formData.fiscal_year || ''}
                                onChange={(e) => setFormData({ ...formData, fiscal_year: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                {[...Array(5)].map((_, i) => {
                                    const year = new Date().getFullYear() + 543 - 2 + i;
                                    return <option key={year} value={year}>{year}</option>;
                                })}
                            </select>
                        </div>

                        {/* 1. Development Guideline (Strategic Plan) */}
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เลือกแผนพัฒนารายประเด็น (Strategic Plan)</label>
                                <select
                                    value={formData.strategicPlanId || ''}
                                    onChange={(e) => handlePlanChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-2"
                                >
                                    <option value="">-- เลือกแผน --</option>
                                    {strategicPlans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <label className="block text-xs text-gray-500 mb-1">แนวทางการพัฒนา (แก้ไขได้)</label>
                                <textarea
                                    rows={2}
                                    value={formData.development_guideline || ''}
                                    onChange={(e) => setFormData({ ...formData, development_guideline: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                />
                            </div>

                            {/* 2. Objective (Strategic Goal) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เลือกเป้าหมาย (Strategic Goal)</label>
                                <select
                                    value={formData.strategicGoalId || ''}
                                    onChange={(e) => handleGoalChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-2"
                                    disabled={!formData.strategicPlanId}
                                >
                                    <option value="">-- เลือกเป้าหมาย --</option>
                                    {strategicGoals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                                <label className="block text-xs text-gray-500 mb-1">วัตถุประสงค์ (แก้ไขได้)</label>
                                <textarea
                                    rows={2}
                                    value={formData.objective || ''}
                                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                />
                            </div>

                            {/* 3. Governance Indicator */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เลือกตัวชี้วัดจากแผน (Optional)</label>
                                <select
                                    onChange={(e) => handleStrategicIndicatorSelect(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-2"
                                    disabled={!formData.strategicGoalId}
                                    value=""
                                >
                                    <option value="">-- เลือกเพื่อนำเข้าข้อมูล --</option>
                                    {strategicIndicatorsList.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                                <label className="block text-xs text-gray-500 mb-1">ตัวชี้วัดของแนวทางพัฒนา</label>
                                <input
                                    type="text"
                                    value={formData.governance_indicator || ''}
                                    onChange={(e) => setFormData({ ...formData, governance_indicator: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                />
                            </div>
                        </div>

                        {/* 3. Annual Target (Moved out of grouped box if preferred, or kept here) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ค่าเป้าหมาย รายปี ({formData.fiscal_year})</label>
                            <input
                                type="text"
                                value={formData.annual_target || ''}
                                onChange={(e) => setFormData({ ...formData, annual_target: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">หน่วยงาน</label>
                            <select
                                value={formData.agency || ''}
                                onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">เลือกหน่วยงาน</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">งบประมาณ</label>
                                <input
                                    type="text"
                                    value={formData.budget || ''}
                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">โครงการ/กิจกรรม</label>
                                <input
                                    type="text"
                                    value={formData.project_name || formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">แหล่งงบประมาณ</label>
                                <input
                                    type="text"
                                    value={formData.source || ''}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">กลุ่มเป้าหมาย (รายละเอียด)</label>
                                <input
                                    type="text"
                                    placeholder="เช่น เกษตรกรในพื้นที่, นักเรียน"
                                    value={formData.target_group || ''}
                                    onChange={(e) => setFormData({ ...formData, target_group: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-2"
                                />
                                <div className="flex gap-2 items-center">
                                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">จำนวน:</label>
                                    <input
                                        type="text"
                                        placeholder="ระบุจำนวน (เช่น 50 คน)"
                                        value={formData.target_group_amount || ''}
                                        onChange={(e) => setFormData({ ...formData, target_group_amount: e.target.value })}
                                        className="flex-1 px-3 py-1.5 min-w-0 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่ม</label>
                                <input
                                    type="date"
                                    value={formData.start_date || ''}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
                                <input
                                    type="date"
                                    value={formData.end_date || ''}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">หน่วยงานรับผิดชอบ (สนับสนุน)</label>
                            <input
                                type="text"
                                value={formData.support_agency || ''}
                                onChange={(e) => setFormData({ ...formData, support_agency: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ผู้รับผิดชอบโครงการ</label>
                            <input
                                type="text"
                                value={formData.responsible_person || ''}
                                onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Indicators Section */}
                        <div className="border-t pt-4 mt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">ตัวชี้วัด (KPIs)</h3>
                                <button
                                    type="button"
                                    onClick={addIndicatorRow}
                                    className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    เพิ่มตัวชี้วัด
                                </button>
                            </div>

                            <div className="space-y-3">
                                {indicators.map((ind, index) => (
                                    <div key={index} className="flex gap-3 items-start">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="ชื่อตัวชี้วัด (เช่น จำนวนผู้เข้าร่วม)"
                                                value={ind.name || ''}
                                                onChange={(e) => updateIndicatorRow(index, 'name', e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                            />
                                        </div>
                                        <div className="w-24">
                                            <input
                                                type="text"
                                                placeholder="เป้าหมาย"
                                                value={ind.target || ''}
                                                onChange={(e) => updateIndicatorRow(index, 'target', e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                            />
                                        </div>
                                        <div className="w-20">
                                            <input
                                                type="text"
                                                placeholder="หน่วย"
                                                value={ind.unit || ''}
                                                onChange={(e) => updateIndicatorRow(index, 'unit', e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeIndicatorRow(index)}
                                            className="p-2 text-gray-400 hover:text-red-600"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                                {indicators.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                        ยังไม่มีตัวชี้วัด คลิก &apos;เพิ่มตัวชี้วัด&apos; เพื่อกำหนดค่าเป้าหมาย
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setShowEditModal(false);
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={showCreateModal ? submitCreate : submitEdit}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                {showCreateModal ? 'สร้างโครงการ' : 'บันทึกการเปลี่ยนแปลง'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation */}
            {showDeleteModal && selectedProject && (
                <ConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={confirmDelete}
                    title="ยืนยันการลบโครงการ"
                    message={`คุณแน่ใจหรือไม่ที่จะลบโครงการ "${selectedProject.project_name || selectedProject.name}"?`}
                    confirmText="ลบ"
                />
            )}
        </div>
    );
}
