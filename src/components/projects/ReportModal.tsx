'use client';

import { Project, Indicator } from '@/lib/types';
import Modal from '@/components/ui/Modal';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    project: Project | null;
    reportData: {
        progress: string;
        budgetSpent: string;
        performance: string;
        issues: string;
        activities: string;
        indicatorResults: Record<string, string>;
    };
    onReportDataChange: (data: any) => void;
    projectIndicators: Indicator[];
}

export default function ReportModal({ isOpen, onClose, onSubmit, project, reportData, onReportDataChange, projectIndicators }: ReportModalProps) {
    if (!project) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`รายงานผลการดำเนินงาน: ${project.project_name || project.name}`}
            maxWidth="max-w-4xl"
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="block text-gray-500">งบประมาณทั้งหมด</span>
                                <span className="font-semibold">{Number(project.budget).toLocaleString()} บาท</span>
                            </div>
                            <div>
                                <span className="block text-gray-500">ใช้ไปแล้ว (สะสมเดิม)</span>
                                <span className="font-semibold">{Number(project.budget_spent || 0).toLocaleString()} บาท</span>
                            </div>
                            <div>
                                <span className="block text-gray-500">คงเหลือ</span>
                                <span className="font-semibold text-green-600">{(Number(project.budget) - Number(project.budget_spent || 0)).toLocaleString()} บาท</span>
                            </div>
                            <div>
                                <span className="block text-gray-500">ความก้าวหน้าล่าสุด</span>
                                <span className="font-semibold text-indigo-600">{project.progress}%</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">กิจกรรมที่ดำเนินการ (ในรอบนี้)</label>
                        <textarea
                            rows={3}
                            value={reportData.activities}
                            onChange={(e) => onReportDataChange({ ...reportData, activities: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 sm:text-sm"
                            placeholder="ระบุกิจกรรมสำคัญที่ทำ..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ผลการดำเนินงาน</label>
                        <select
                            value={reportData.performance}
                            onChange={(e) => onReportDataChange({ ...reportData, performance: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-600 sm:text-sm"
                        >
                            <option value="">-- เลือกสถานะ --</option>
                            <option value="บรรลุวัตถุประสงค์">บรรลุวัตถุประสงค์</option>
                            <option value="อยู่ระหว่างดำเนินการ">อยู่ระหว่างดำเนินการ</option>
                            <option value="ต่ำกว่าเป้าหมาย">ต่ำกว่าเป้าหมาย</option>
                            <option value="ยุติโครงการ">ยุติโครงการ</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">งบประมาณที่ใช้ (เฉพาะครั้งนี้)</label>
                        <div className="relative mt-1 rounded-md shadow-sm">
                            <input
                                type="number"
                                value={reportData.budgetSpent}
                                onChange={(e) => onReportDataChange({ ...reportData, budgetSpent: e.target.value })}
                                className="block w-full rounded-md border border-gray-300 pl-3 pr-12 py-2 focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
                                placeholder="0.00"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-gray-500 sm:text-sm">บาท</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Indicators Update Section */}
                <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-md font-medium text-gray-900 mb-3">ผลการดำเนินงานตามตัวชี้วัด</h3>
                    {projectIndicators.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">ไม่มีตัวชี้วัดในโครงการนี้</p>
                    ) : (
                        <div className="space-y-4">
                            {projectIndicators.map((ind) => (
                                <div key={ind.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{ind.name}</p>
                                            <p className="text-xs text-gray-500">เป้าหมาย: {ind.target} {ind.unit}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">ผลการดำเนินงาน (สะสม)</label>
                                        <input
                                            type="text"
                                            value={reportData.indicatorResults[ind.id] || ''}
                                            onChange={(e) => {
                                                const newResults = { ...reportData.indicatorResults, [ind.id]: e.target.value };
                                                onReportDataChange({ ...reportData, indicatorResults: newResults });
                                            }}
                                            className="block w-full rounded-md border border-gray-300 px-3 py-1.5 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-xs"
                                            placeholder="ระบุผลงาน..."
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">ปัญหา / อุปสรรค</label>
                    <textarea
                        rows={3}
                        value={reportData.issues}
                        onChange={(e) => onReportDataChange({ ...reportData, issues: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 sm:text-sm"
                    />
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
                        type="button"
                        onClick={onSubmit}
                        className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        บันทึกรายงาน
                    </button>
                </div>
            </div>
        </Modal>
    );
}
