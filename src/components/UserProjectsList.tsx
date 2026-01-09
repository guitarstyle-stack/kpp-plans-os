'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/lib/types';
import toast from 'react-hot-toast';
import Modal from './ui/Modal';

export default function UserProjectsList({ userDepartment }: { userDepartment?: string }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [newProgress, setNewProgress] = useState('');

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

    const handleViewDetail = (project: Project) => {
        setSelectedProject(project);
        setShowDetailModal(true);
    };

    const handleUpdateProgress = (project: Project) => {
        setSelectedProject(project);
        setNewProgress(project.progress);
        setShowProgressModal(true);
    };

    const submitProgress = async () => {
        if (!selectedProject) return;

        try {
            const res = await fetch(`/api/projects/${selectedProject.id}/progress`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ progress: newProgress })
            });

            if (res.ok) {
                toast.success('อัปเดตความคืบหน้าสำเร็จ');
                setShowProgressModal(false);
                fetchProjects();
            } else {
                toast.error('ไม่สามารถอัปเดตได้');
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
            <div>
                <h1 className="text-3xl font-bold text-gray-900">โครงการของฉัน</h1>
                <p className="text-gray-600 mt-1">
                    {userDepartment ? `โครงการของ${userDepartment}` : 'โครงการทั้งหมด'}
                </p>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        ยังไม่มีโครงการ
                    </div>
                ) : (
                    projects.map((project) => (
                        <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.project_name || project.name}</h3>
                            <p className="text-sm text-gray-600 mb-4">{project.agency}</p>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">งบประมาณ:</span>
                                    <span className="font-medium">{project.budget}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">สถานะ:</span>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${project.status === 'Completed' || project.status === 'ดำเนินการแล้วเสร็จ'
                                        ? 'bg-green-100 text-green-800'
                                        : project.status === 'In Progress' || project.status === 'กำลังดำเนินการ'
                                            ? 'bg-orange-100 text-orange-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {project.status}
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500">ความคืบหน้า</span>
                                    <span className="font-medium">{project.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-indigo-600 h-2 rounded-full transition-all"
                                        style={{ width: `${project.progress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleViewDetail(project)}
                                    className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    ดูรายละเอียด
                                </button>
                                <button
                                    onClick={() => handleUpdateProgress(project)}
                                    className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    อัปเดตความคืบหน้า
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

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
                                <label className="block text-sm font-medium text-gray-500">วันที่เริ่ม</label>
                                <p className="text-gray-900">{selectedProject.start_date}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">วันที่สิ้นสุด</label>
                                <p className="text-gray-900">{selectedProject.end_date}</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">ผู้รับผิดชอบ</label>
                            <p className="text-gray-900">{selectedProject.responsible_person || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">รายละเอียด</label>
                            <p className="text-gray-900">{selectedProject.description || '-'}</p>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Progress Update Modal */}
            {showProgressModal && selectedProject && (
                <Modal
                    isOpen={showProgressModal}
                    onClose={() => setShowProgressModal(false)}
                    title="อัปเดตความคืบหน้า"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ความคืบหน้า (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={newProgress}
                                onChange={(e) => setNewProgress(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowProgressModal(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={submitProgress}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                บันทึก
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
