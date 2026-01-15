'use client';

import { useState, useEffect } from 'react';
import { Department } from '@/lib/types';
import toast from 'react-hot-toast';
import ConfirmationModal from './ui/ConfirmationModal';
import Modal from './ui/Modal';

export default function DepartmentsClient() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [formData, setFormData] = useState({ name: '', organization_type: '' });
    const [searchTerm, setSearchTerm] = useState('');

    // Filter and Sort
    const filteredDepartments = departments
        .filter(dept => dept.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name, 'th'));

    // Confirmation Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deptToDelete, setDeptToDelete] = useState<string | null>(null);

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/departments');
            if (res.ok) {
                const data = await res.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('โหลดข้อมูลหน่วยงานไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleOpenModal = (dept?: Department) => {
        setEditingDept(dept || null);
        setFormData({ name: dept ? dept.name : '', organization_type: dept?.organization_type || '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDept(null);
        setFormData({ name: '', organization_type: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingDept ? 'PUT' : 'POST';
        const body = editingDept ? { id: editingDept.id, name: formData.name, organization_type: formData.organization_type } : { name: formData.name, organization_type: formData.organization_type };

        const promise = fetch('/api/departments', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }).then(async (res) => {
            if (!res.ok) throw new Error('Failed');
            return res.json();
        });

        toast.promise(promise, {
            loading: 'กำลังบันทึกข้อมูล...',
            success: 'บันทึกข้อมูลสำเร็จ',
            error: 'บันทึกข้อมูลไม่สำเร็จ',
        });

        try {
            await promise;
            handleCloseModal();
            fetchDepartments();
        } catch (error) {
            console.error(error);
        }
    };

    const openDeleteModal = (id: string) => {
        setDeptToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeptToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!deptToDelete) return;

        const promise = fetch(`/api/departments?id=${deptToDelete}`, { method: 'DELETE' })
            .then(async (res) => {
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed');
                }
                return res.json();
            });

        toast.promise(promise, {
            loading: 'กำลังลบ...',
            success: 'ลบข้อมูลสำเร็จ',
            error: (err) => `${err.message}`, // Display server error message
        });

        try {
            await promise;
            fetchDepartments();
        } catch (error) {
            console.error(error);
        } finally {
            closeDeleteModal();
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</div>;

    return (
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-bold text-gray-900 font-display">จัดการหน่วยงาน (Agency)</h3>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="ค้นหาหน่วยงาน..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
                    >
                        + เพิ่มหน่วยงาน
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">รหัส</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ชื่อหน่วยงาน</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ประเภทองค์กร</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {filteredDepartments.map((dept) => (
                            <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-500">{dept.id}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{dept.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {dept.organization_type === 'government' && 'หน่วยงานภาครัฐ'}
                                    {dept.organization_type === 'private' && 'ภาคเอกชน'}
                                    {dept.organization_type === 'local_government' && 'องค์กรปกครองส่วนท้องถิ่น'}
                                    {dept.organization_type === 'civil_society' && 'ภาคประชาสังคม'}
                                    {dept.organization_type === 'other' && 'อื่นๆ'}
                                    {!dept.organization_type && <span className="text-gray-400">-</span>}
                                </td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    <button
                                        onClick={() => handleOpenModal(dept)}
                                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                    >
                                        แก้ไข
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(dept.id)}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                    >
                                        ลบ
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit/Create Modal - Now using the Robust Shared Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingDept ? 'แก้ไขหน่วยงาน' : 'เพิ่มหน่วยงานใหม่'}
            >
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="dept-name" className="block text-sm font-medium text-gray-700 mb-1">ชื่อหน่วยงาน</label>
                        <input
                            type="text"
                            id="dept-name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-shadow"
                            placeholder="เช่น สำนักปลัด"
                            autoFocus
                        />
                    </div>
                    <div className="mt-4">
                        <label htmlFor="dept-type" className="block text-sm font-medium text-gray-700 mb-1">ประเภทองค์กร</label>
                        <select
                            id="dept-type"
                            value={formData.organization_type}
                            onChange={(e) => setFormData({ ...formData, organization_type: e.target.value })}
                            className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-shadow"
                        >
                            <option value="">-- เลือกประเภทองค์กร --</option>
                            <option value="government">หน่วยงานภาครัฐ</option>
                            <option value="private">ภาคเอกชน</option>
                            <option value="local_government">องค์กรปกครองส่วนท้องถิ่น</option>
                            <option value="civil_society">ภาคประชาสังคม</option>
                            <option value="other">อื่นๆ</option>
                        </select>
                    </div>
                    <div className="mt-6 sm:flex sm:flex-row-reverse gap-3">
                        <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm transition-colors"
                        >
                            บันทึก
                        </button>
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 sm:w-auto sm:text-sm transition-colors"
                        >
                            ยกเลิก
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                title="ยืนยันการลบหน่วยงาน"
                message="คุณแน่ใจหรือไม่ที่จะลบหน่วยงานนี้? หากมีผู้ใช้งานสังกัดอยู่ ระบบจะไม่อนุญาตให้ลบ"
                confirmText="ลบข้อมูล"
                cancelText="ยกเลิก"
                isDestructive={true}
            />
        </div>
    );
}
