'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { Department } from '@/lib/types';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function ProfileClient({ user }: { user: User }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        position: user.position || '',
        department_id: user.department_id || '',
        phone: user.phone || '',
        email: user.email || '',
    });

    const [departments, setDepartments] = useState<Department[]>([]);
    const [saving, setSaving] = useState(false);

    // New Department State
    const [isAddingDept, setIsAddingDept] = useState(false);
    const [newDeptName, setNewDeptName] = useState('');
    const [newDeptType, setNewDeptType] = useState('');
    const [addingDeptLoading, setAddingDeptLoading] = useState(false);

    useEffect(() => {
        // Fetch departments for dropdown
        const fetchDepartments = async () => {
            try {
                const res = await fetch('/api/departments');
                if (res.ok) {
                    const data = await res.json();
                    setDepartments(data);
                }
            } catch (error) {
                console.error('Failed to fetch departments', error);
            }
        };
        fetchDepartments();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const promise = fetch('/api/me/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        }).then(async res => {
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to update profile');
            };
            router.refresh(); // Refresh server components to update session/data
            return res.json();
        }).finally(() => setSaving(false));

        toast.promise(promise, {
            loading: 'กำลังบันทึกข้อมูล...',
            success: 'อัปเดตข้อมูลส่วนตัวสำเร็จ',
            error: (err) => `บันทึกไม่สำเร็จ: ${err.message}`,
        });
    };

    return (
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 font-display mb-6">แก้ไขข้อมูลส่วนตัว</h2>



            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center space-x-6 mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={user.picture_url}
                        alt="Profile"
                        className="h-20 w-20 rounded-full border-4 border-gray-100 shadow-sm"
                    />
                    <div>
                        <p className="font-semibold text-lg text-gray-900">{user.display_name}</p>
                        <p className="text-sm text-gray-500">LINE User</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อจริง</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="ระบุชื่อจริง"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="ระบุนามสกุล"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง</label>
                        <input
                            type="text"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="ระบุตำแหน่ง"
                        />
                    </div>
                    <div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">สังกัด (หน่วยงาน)</label>

                            {!isAddingDept ? (
                                <div className="space-y-2">
                                    <select
                                        name="department_id"
                                        value={formData.department_id}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    >
                                        <option value="">-- เลือกหน่วยงาน --</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingDept(true)}
                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                                    >
                                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        หาหน่วยงานไม่เจอ? เพิ่มหน่วยงานใหม่
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="text"
                                            value={newDeptName}
                                            onChange={(e) => setNewDeptName(e.target.value)}
                                            placeholder="ระบุชื่อหน่วยงานใหม่"
                                            className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-indigo-50"
                                            autoFocus
                                        />
                                        <select
                                            value={newDeptType}
                                            onChange={(e) => setNewDeptType(e.target.value)}
                                            className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-indigo-50 text-sm"
                                        >
                                            <option value="">-- เลือกประเภทองค์กร (ไม่บังคับ) --</option>
                                            <option value="government">หน่วยงานภาครัฐ</option>
                                            <option value="private">ภาคเอกชน</option>
                                            <option value="local_government">องค์กรปกครองส่วนท้องถิ่น</option>
                                            <option value="civil_society">ภาคประชาสังคม</option>
                                            <option value="other">อื่นๆ</option>
                                        </select>
                                        <button
                                            type="button"
                                            disabled={!newDeptName.trim() || addingDeptLoading}
                                            onClick={async () => {
                                                if (!newDeptName.trim()) return;
                                                setAddingDeptLoading(true);
                                                try {
                                                    const res = await fetch('/api/departments', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            name: newDeptName.trim(),
                                                            organization_type: newDeptType
                                                        })
                                                    });

                                                    if (res.ok) {
                                                        const newDept = await res.json();
                                                        // Add to list, select it, and close mode
                                                        setDepartments([...departments, newDept]);
                                                        setFormData(prev => ({ ...prev, department_id: newDept.id }));
                                                        setIsAddingDept(false);
                                                        setNewDeptName('');
                                                        setNewDeptType('');
                                                        toast.success(`เพิ่มหน่วยงาน "${newDept.name}" เรียบร้อย`);
                                                    } else {
                                                        throw new Error('Failed to add');
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    toast.error('เพิ่มหน่วยงานไม่สำเร็จ');
                                                } finally {
                                                    setAddingDeptLoading(false);
                                                }
                                            }}
                                            className="w-full px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {addingDeptLoading ? '...' : 'บันทึกหน่วยงานใหม่'}
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddingDept(false);
                                            setNewDeptName('');
                                            setNewDeptType('');
                                        }}
                                        className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                                    >
                                        ยกเลิก
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="08x-xxx-xxxx"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="example@email.com"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                    </button>
                </div>
            </form>
        </div>
    );
}
