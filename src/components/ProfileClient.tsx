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
    const [message, setMessage] = useState('');

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
        });

        toast.promise(promise, {
            loading: 'กำลังบันทึกข้อมูล...',
            success: 'อัปเดตข้อมูลส่วนตัวสำเร็จ',
            error: (err) => `บันทึกไม่สำเร็จ: ${err.message}`,
        });
    };

    return (
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 font-display mb-6">แก้ไขข้อมูลส่วนตัว</h2>

            {message && (
                <div className={`mb-6 p-4 rounded-lg text-sm ${message.includes('สำเร็จ') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center space-x-6 mb-6">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">สังกัด (หน่วยงาน)</label>
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
