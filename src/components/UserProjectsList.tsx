'use client';

import { useState, useEffect } from 'react';
import { Project, Indicator } from '@/lib/types';
import toast from 'react-hot-toast';
import Modal from './ui/Modal';
import ConfirmationModal from './ui/ConfirmationModal';

export default function UserProjectsList({ userDepartment }: { userDepartment?: string }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    // Create Project State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createFormData, setCreateFormData] = useState<Partial<Project>>({});
    const [createIndicators, setCreateIndicators] = useState<Partial<Indicator>[]>([]);

    // Edit Project State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<Project>>({});
    const [editIndicators, setEditIndicators] = useState<Partial<Indicator>[]>([]);

    // Delete Project State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

    // Project Indicators for Reporting
    const [projectIndicators, setProjectIndicators] = useState<Indicator[]>([]);

    // Report Form Data
    const [reportData, setReportData] = useState({
        progress: '',
        budgetSpent: '',
        performance: '',
        issues: '',
        indicatorResults: {} as Record<string, string>
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (error) {
            toast.error('ไม่สามารถโหลดข้อมูลได้');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = () => {
        setCreateFormData({
            project_name: '',
            agency: userDepartment || '', // Auto-assign department
            budget: '0',
            start_date: '',
            end_date: '',
            status: 'Not Started',
            progress: '0',
            fiscal_year: new Date().getFullYear() + 543 + '',
            responsible_person: '',
            description: ''
        });
        setCreateIndicators([]);
        setShowCreateModal(true);
    };

    const addIndicatorRow = (isEdit = false) => {
        if (isEdit) {
            setEditIndicators([...editIndicators, { name: '', target: '', unit: '', id: '' }]);
        } else {
            setCreateIndicators([...createIndicators, { name: '', target: '', unit: '', id: '' }]);
        }
    };

    const removeIndicatorRow = (index: number, isEdit = false) => {
        if (isEdit) {
            const newIndicators = [...editIndicators];
            newIndicators.splice(index, 1);
            setEditIndicators(newIndicators);
        } else {
            const newIndicators = [...createIndicators];
            newIndicators.splice(index, 1);
            setCreateIndicators(newIndicators);
        }
    };

    const handleIndicatorChange = (index: number, field: keyof Indicator, value: string, isEdit = false) => {
        if (isEdit) {
            const newIndicators = [...editIndicators];
            newIndicators[index] = { ...newIndicators[index], [field]: value };
            setEditIndicators(newIndicators);
        } else {
            const newIndicators = [...createIndicators];
            newIndicators[index] = { ...newIndicators[index], [field]: value };
            setCreateIndicators(newIndicators);
        }
    };

    const submitCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...createFormData,
                indicators: createIndicators
            };

            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success('สร้างโครงการสำเร็จ');
                setShowCreateModal(false);
                fetchProjects();
            } else {
                toast.error('ไม่สามารถสร้างโครงการได้');
            }
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    const handleEditProject = async (project: Project) => {
        setSelectedProject(project);
        setEditFormData(project);
        setEditIndicators([]);

        try {
            const res = await fetch(`/api/indicators?projectId=${project.id}`);
            if (res.ok) {
                const data = await res.json();
                setEditIndicators(data);
            }
        } catch (error) {
            console.error('Failed to load indicators:', error);
        }

        setShowEditModal(true);
    };

    const submitEditProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...editFormData,
                indicators: editIndicators
            };

            const res = await fetch(`/api/projects/${selectedProject?.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success('แก้ไขโครงการสำเร็จ');
                setShowEditModal(false);
                fetchProjects();
            } else {
                toast.error('ไม่สามารถแก้ไขโครงการได้');
            }
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    const handleDeleteProject = (project: Project) => {
        setProjectToDelete(project);
        setShowDeleteModal(true);
    };

    const confirmDeleteProject = async () => {
        if (!projectToDelete) return;

        try {
            const res = await fetch(`/api/projects/${projectToDelete.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success('ลบโครงการเรียบร้อยแล้ว');
                setShowDeleteModal(false);
                setProjectToDelete(null);
                fetchProjects();
            } else {
                toast.error('ไม่สามารถลบโครงการได้');
            }
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาดในการลบ');
        }
    };

    const handleViewDetail = (project: Project) => {
        setSelectedProject(project);
        setShowDetailModal(true);
    };

    const handleReportProgress = async (project: Project) => {
        setSelectedProject(project);
        setReportData({
            progress: project.progress,
            budgetSpent: '0',
            performance: '',
            issues: '',
            indicatorResults: {}
        });

        // Fetch Indicators
        try {
            const res = await fetch(`/api/indicators?projectId=${project.id}`);
            if (res.ok) {
                const indicators = await res.json();
                setProjectIndicators(indicators);

                // Initialize indicator results
                const initialResults: Record<string, string> = {};
                indicators.forEach((ind: Indicator) => {
                    initialResults[ind.id] = ind.result || '';
                });
                setReportData(prev => ({ ...prev, indicatorResults: initialResults }));
            }
        } catch (error) {
            console.error('Error fetching indicators:', error);
        }

        setShowReportModal(true);
    };

    const submitReport = async () => {
        if (!selectedProject) return;

        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: selectedProject.id,
                    ...reportData,
                    progress: Number(reportData.progress),
                    budgetSpent: Number(reportData.budgetSpent)
                })
            });

            if (res.ok) {
                toast.success('ส่งรายงานความก้าวหน้าสำเร็จ');
                setShowReportModal(false);
                fetchProjects();
            } else {
                toast.error('ไม่สามารถส่งรายงานได้');
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
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">โครงการของฉัน</h2>
                <button
                    onClick={handleCreateProject}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    สร้างโครงการ
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    ไม่พบข้อมูลโครงการ
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อโครงการ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ความคืบหน้า</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {projects.map((project) => (
                                <tr key={project.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{project.project_name || project.name}</div>
                                        <div className="text-xs text-gray-500">{project.fiscal_year}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${project.status === 'Completed' || project.status === 'ดำเนินการแล้วเสร็จ' ? 'bg-green-100 text-green-800' :
                                                project.status === 'In Progress' || project.status === 'กำลังดำเนินการ' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 max-w-[100px]">
                                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                        </div>
                                        <span className="text-xs text-gray-500 mt-1">{project.progress}%</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleReportProgress(project)}
                                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md"
                                        >
                                            รายงานผล
                                        </button>
                                        <button
                                            onClick={() => handleViewDetail(project)}
                                            className="text-gray-600 hover:text-gray-900 bg-gray-50 px-3 py-1 rounded-md"
                                        >
                                            รายละเอียด
                                        </button>
                                        <button
                                            onClick={() => handleEditProject(project)}
                                            className="text-amber-600 hover:text-amber-900 bg-amber-50 px-3 py-1 rounded-md"
                                        >
                                            แก้ไข
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProject(project)}
                                            className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md"
                                        >
                                            ลบ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Project Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="สร้างโครงการใหม่"
            >
                <form onSubmit={submitCreateProject} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">ชื่อโครงการ</label>
                            <input
                                type="text"
                                required
                                value={createFormData.project_name || ''}
                                onChange={(e) => setCreateFormData({ ...createFormData, project_name: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">ปีงบประมาณ</label>
                            <input
                                type="text"
                                required
                                value={createFormData.fiscal_year || ''}
                                onChange={(e) => setCreateFormData({ ...createFormData, fiscal_year: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">งบประมาณ (บาท)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={createFormData.budget || ''}
                                onChange={(e) => setCreateFormData({ ...createFormData, budget: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">วันที่เริ่มต้น</label>
                            <input
                                type="date"
                                required
                                value={createFormData.start_date || ''}
                                onChange={(e) => setCreateFormData({ ...createFormData, start_date: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">วันที่สิ้นสุด</label>
                            <input
                                type="date"
                                required
                                value={createFormData.end_date || ''}
                                onChange={(e) => setCreateFormData({ ...createFormData, end_date: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700">แหล่งงบประมาณ</label>
                            <input
                                type="text"
                                value={createFormData.source || ''}
                                onChange={(e) => setCreateFormData({ ...createFormData, source: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700">กลุ่มเป้าหมาย</label>
                            <input
                                type="text"
                                value={createFormData.target_group || ''}
                                onChange={(e) => setCreateFormData({ ...createFormData, target_group: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">ผู้รับผิดชอบ</label>
                            <input
                                type="text"
                                required
                                value={createFormData.responsible_person || ''}
                                onChange={(e) => setCreateFormData({ ...createFormData, responsible_person: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">รายละเอียด</label>
                            <textarea
                                rows={3}
                                value={createFormData.description || ''}
                                onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">ตัวชี้วัด (Indicators)</h3>
                            <button
                                type="button"
                                onClick={() => addIndicatorRow(false)}
                                className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                                + เพิ่มตัวชี้วัด
                            </button>
                        </div>

                        {createIndicators.map((ind, index) => (
                            <div key={index} className="flex gap-4 mb-3 items-start">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="ชื่อตัวชี้วัด"
                                        required
                                        value={ind.name || ''}
                                        onChange={(e) => handleIndicatorChange(index, 'name', e.target.value, false)}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div className="w-24">
                                    <input
                                        type="text"
                                        placeholder="เป้าหมาย"
                                        required
                                        value={ind.target || ''}
                                        onChange={(e) => handleIndicatorChange(index, 'target', e.target.value, false)}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div className="w-20">
                                    <input
                                        type="text"
                                        placeholder="หน่วย"
                                        required
                                        value={ind.unit || ''}
                                        onChange={(e) => handleIndicatorChange(index, 'unit', e.target.value, false)}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeIndicatorRow(index, false)}
                                    className="text-red-600 hover:text-red-800 p-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        {createIndicators.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-md border border-dashed border-gray-300">
                                ยังไม่มีตัวชี้วัด
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 text-sm font-medium"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium"
                        >
                            สร้างโครงการ
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Project Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="แก้ไขโครงการ"
            >
                <form onSubmit={submitEditProject} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">ชื่อโครงการ</label>
                            <input
                                type="text"
                                required
                                value={editFormData.project_name || editFormData.name || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, project_name: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">ปีงบประมาณ</label>
                            <input
                                type="text"
                                required
                                value={editFormData.fiscal_year || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, fiscal_year: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">งบประมาณ (บาท)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={editFormData.budget || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, budget: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">วันที่เริ่มต้น</label>
                            <input
                                type="date"
                                required
                                value={editFormData.start_date || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, start_date: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">วันที่สิ้นสุด</label>
                            <input
                                type="date"
                                required
                                value={editFormData.end_date || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, end_date: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700">แหล่งงบประมาณ</label>
                            <input
                                type="text"
                                value={editFormData.source || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, source: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700">กลุ่มเป้าหมาย</label>
                            <input
                                type="text"
                                value={editFormData.target_group || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, target_group: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">ผู้รับผิดชอบ</label>
                            <input
                                type="text"
                                required
                                value={editFormData.responsible_person || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, responsible_person: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">รายละเอียด</label>
                            <textarea
                                rows={3}
                                value={editFormData.description || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">ตัวชี้วัด (Indicators)</h3>
                            <button
                                type="button"
                                onClick={() => addIndicatorRow(true)}
                                className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                                + เพิ่มตัวชี้วัด
                            </button>
                        </div>

                        {editIndicators.map((ind, index) => (
                            <div key={index} className="flex gap-4 mb-3 items-start">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="ชื่อตัวชี้วัด"
                                        required
                                        value={ind.name || ''}
                                        onChange={(e) => handleIndicatorChange(index, 'name', e.target.value, true)}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div className="w-24">
                                    <input
                                        type="text"
                                        placeholder="เป้าหมาย"
                                        required
                                        value={ind.target || ''}
                                        onChange={(e) => handleIndicatorChange(index, 'target', e.target.value, true)}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div className="w-20">
                                    <input
                                        type="text"
                                        placeholder="หน่วย"
                                        required
                                        value={ind.unit || ''}
                                        onChange={(e) => handleIndicatorChange(index, 'unit', e.target.value, true)}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeIndicatorRow(index, true)}
                                    className="text-red-600 hover:text-red-800 p-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        {editIndicators.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-md border border-dashed border-gray-300">
                                ยังไม่มีตัวชี้วัด
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => setShowEditModal(false)}
                            className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 text-sm font-medium"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium"
                        >
                            บันทึกการแก้ไข
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDeleteProject}
                title="ยืนยันการลบโครงการ"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบโครงการ "${projectToDelete?.project_name || projectToDelete?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            />

            {/* Detail Modal */}
            {showDetailModal && selectedProject && (
                <Modal
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    title="รายละเอียดโครงการ"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500">ชื่อโครงการ</label>
                            <p className="text-gray-900">{selectedProject.project_name || selectedProject.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">หน่วยงาน</label>
                            <p className="text-gray-900">{selectedProject.agency}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">งบประมาณ</label>
                            <p className="text-gray-900">{selectedProject.budget}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">วันที่เริ่มต้น</label>
                                <p className="text-gray-900">{selectedProject.start_date || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">วันที่สิ้นสุด</label>
                                <p className="text-gray-900">{selectedProject.end_date || '-'}</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">สถานะ</label>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${selectedProject.status === 'Completed' || selectedProject.status === 'ดำเนินการแล้วเสร็จ' ? 'bg-green-100 text-green-800' :
                                    selectedProject.status === 'In Progress' || selectedProject.status === 'กำลังดำเนินการ' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'}`}>
                                {selectedProject.status}
                            </span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">ความคืบหน้า</label>
                            <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${selectedProject.progress}%` }}></div>
                                </div>
                                <span className="text-sm text-gray-500">{selectedProject.progress}%</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">รายละเอียด</label>
                            <p className="text-gray-900">{selectedProject.description || '-'}</p>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Report Form Modal */}
            {showReportModal && selectedProject && (
                <Modal
                    isOpen={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    title="รายงานความก้าวหน้า"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ความคืบหน้าปัจจุบัน (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={reportData.progress}
                                onChange={(e) => setReportData({ ...reportData, progress: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">งบประมาณที่ใช้ไป (บาท)</label>
                            <input
                                type="number"
                                min="0"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={reportData.budgetSpent}
                                onChange={(e) => setReportData({ ...reportData, budgetSpent: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">ผลการดำเนินงาน</label>
                            <textarea
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                rows={3}
                                value={reportData.performance}
                                onChange={(e) => setReportData({ ...reportData, performance: e.target.value })}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">ปัญหา / อุปสรรค</label>
                            <textarea
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                rows={3}
                                value={reportData.issues}
                                onChange={(e) => setReportData({ ...reportData, issues: e.target.value })}
                            ></textarea>
                        </div>

                        {/* Indicators Update Section */}
                        {projectIndicators.length > 0 && (
                            <div className="border-t pt-4">
                                <h4 className="font-medium text-gray-900 mb-3">บันทึกผลตัวชี้วัด</h4>
                                <div className="space-y-3">
                                    {projectIndicators.map((ind) => (
                                        <div key={ind.id} className="grid grid-cols-2 gap-4 items-center">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">{ind.name}</p>
                                                <p className="text-xs text-gray-500">เป้าหมาย: {ind.target} {ind.unit}</p>
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="ผลลัพธ์ล่าสุด"
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    value={reportData.indicatorResults[ind.id] || ''}
                                                    onChange={(e) => setReportData(prev => ({
                                                        ...prev,
                                                        indicatorResults: {
                                                            ...prev.indicatorResults,
                                                            [ind.id]: e.target.value
                                                        }
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={submitReport}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
                            >
                                บันทึกรายงาน
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
