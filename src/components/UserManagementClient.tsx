'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { Department } from '@/lib/types';
import toast from 'react-hot-toast';
import ConfirmationModal from './ui/ConfirmationModal';
import Modal from './ui/Modal';
import { TableRowSkeleton } from './ui/Skeleton';

export default function UserManagementClient() {
    const [users, setUsers] = useState<User[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const [usersRes, deptsRes] = await Promise.all([
                fetch('/api/users'),
                fetch('/api/departments')
            ]);

            if (usersRes.ok && deptsRes.ok) {
                const usersData = await usersRes.json();
                const deptsData = await deptsRes.json();
                setUsers(usersData);
                setDepartments(deptsData);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
            toast.error('โหลดข้อมูลไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRoleChange = async (userId: string, newRole: string) => {
        const promise = fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole }),
        }).then(async res => {
            if (!res.ok) throw new Error('Failed');
            return res.json();
        });

        toast.promise(promise, {
            loading: 'กำลังอัปเดตสิทธิ์...',
            success: 'อัปเดตสิทธิ์สำเร็จ',
            error: 'อัปเดตสิทธิ์ไม่สำเร็จ',
        });

        try {
            await promise;
            fetchData();
        } catch (e) { console.error(e) }
    };

    const handleStatusChange = async (userId: string, newStatus: string) => {
        const promise = fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        }).then(async res => {
            if (!res.ok) throw new Error('Failed');
            return res.json();
        });

        toast.promise(promise, {
            loading: 'กำลังอัปเดตสถานะ...',
            success: 'อัปเดตสถานะสำเร็จ',
            error: 'อัปเดตสถานะไม่สำเร็จ',
        });

        try {
            await promise;
            fetchData();
        } catch (e) { console.error(e) }
    };

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editFormData, setEditFormData] = useState({
        first_name: '',
        last_name: '',
        position: '',
        department_id: '',
        phone: '',
        email: ''
    });

    const handleEditOpen = (user: User) => {
        setEditingUser(user);
        setEditFormData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            position: user.position || '',
            department_id: user.department_id || '',
            phone: user.phone || '',
            email: user.email || ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditClose = () => {
        setIsEditModalOpen(false);
        setEditingUser(null);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        const promise = fetch(`/api/users/${editingUser.line_user_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editFormData),
        }).then(async res => {
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
            fetchData();
            handleEditClose();
        } catch (error) {
            console.error(error);
        }
    };

    const openDeleteModal = (userId: string) => {
        setUserToDelete(userId);
        setIsDeleteModalOpen(true);
    }

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    }

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        const promise = fetch(`/api/users/${userToDelete}`, { method: 'DELETE' })
            .then(async res => {
                if (!res.ok) throw new Error('Failed');
                return res.json();
            });

        toast.promise(promise, {
            loading: 'กำลังลบผู้ใช้งาน...',
            success: 'ลบผู้ใช้งานสำเร็จ',
            error: 'ลบผู้ใช้งานไม่สำเร็จ',
        });

        try {
            await promise;
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            closeDeleteModal();
        }
    };

    const getDepartmentName = (id?: string) => {
        if (!id) return '-';
        const dept = departments.find(d => d.id === id);
        return dept ? dept.name : id;
    };

    return (
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 font-display">จัดการผู้ใช้งาน</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ผู้ใช้งาน</th>
                            <th className="px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ตำแหน่ง/สังกัด</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">สิทธิ์การใช้งาน</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">สถานะ</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ข้อมูลส่วนตัว</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {loading ? (
                            <>
                                <TableRowSkeleton cols={6} />
                                <TableRowSkeleton cols={6} />
                                <TableRowSkeleton cols={6} />
                            </>
                        ) : users.map((user) => (
                            <tr key={user.line_user_id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        {user.picture_url && <img className="h-8 w-8 rounded-full mr-3" src={user.picture_url} alt="" />}
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{user.display_name}</div>
                                            <div className="text-xs text-gray-500">ID: {user.line_user_id.substring(0, 8)}...</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{user.position || '-'}</div>
                                    <div className="text-xs text-gray-500">{getDepartmentName(user.department_id)}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.line_user_id, e.target.value)}
                                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleStatusChange(user.line_user_id, user.status === 'active' ? 'inactive' : 'active')}
                                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                    >
                                        {user.status}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div>{user.first_name} {user.last_name}</div>
                                    <div className="text-xs">{user.phone}</div>
                                    <div className="text-xs">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    <button
                                        onClick={() => handleEditOpen(user)}
                                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                    >
                                        แก้ไข
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(user.line_user_id)}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                                    >
                                        ลบ
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit User Modal */}
            {/* Edit User Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={handleEditClose}
                title="แก้ไขข้อมูลผู้ใช้งาน"
            >
                <form onSubmit={handleEditSubmit}>
                    <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ชื่อจริง</label>
                            <input
                                type="text"
                                value={editFormData.first_name}
                                onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">นามสกุล</label>
                            <input
                                type="text"
                                value={editFormData.last_name}
                                onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">ตำแหน่ง</label>
                            <input
                                type="text"
                                value={editFormData.position}
                                onChange={(e) => setEditFormData({ ...editFormData, position: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">สังกัด / หน่วยงาน</label>
                            <select
                                value={editFormData.department_id}
                                onChange={(e) => setEditFormData({ ...editFormData, department_id: e.target.value })}
                                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">ระบุสังกัด</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                            <input
                                type="text"
                                value={editFormData.phone}
                                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">อีเมล</label>
                            <input
                                type="email"
                                value={editFormData.email}
                                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            บันทึก
                        </button>
                        <button
                            type="button"
                            onClick={handleEditClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
                title="ยืนยันการลบผู้ใช้งาน"
                message="คุณแน่ใจหรือไม่ที่จะลบผู้ใช้งานนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
                isDestructive={true}
            />
        </div>
    );
}
