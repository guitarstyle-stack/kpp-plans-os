'use client';

import { Project, ProjectReport, Indicator } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import { useState, useEffect } from 'react';

interface ProjectDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
}

export default function ProjectDetailModal({ isOpen, onClose, project }: ProjectDetailModalProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'indicators' | 'history'>('info');
    const [reports, setReports] = useState<ProjectReport[]>([]);
    const [indicators, setIndicators] = useState<Indicator[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!project) return;
            setLoading(true);
            try {
                const [repRes, indRes] = await Promise.all([
                    fetch(`/api/reports?projectId=${project.id}`), // Expecting GET reports endpoint
                    fetch(`/api/indicators?projectId=${project.id}`)
                ]);

                if (repRes.ok) setReports(await repRes.json());
                if (indRes.ok) setIndicators(await indRes.json());
            } catch (error) {
                console.error("Failed to fetch details", error);
            } finally {
                setLoading(false);
            }
        };

        if (project && isOpen) {
            fetchDetails();
        }
    }, [project, isOpen]);

    if (!project) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`รายละเอียดโครงการ: ${project.project_name || project.name}`}
            maxWidth="max-w-4xl"
        >
            <div className="flex border-b border-gray-200 mb-4">
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'info' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('info')}
                >
                    ข้อมูลทั่วไป
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'indicators' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('indicators')}
                >
                    ตัวชี้วัด ({indicators.length})
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'history' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('history')}
                >
                    ประวัติการรายงาน ({reports.length})
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
            ) : (
                <div className="min-h-[300px]">
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="md:col-span-2 bg-gray-50 p-3 rounded-lg border">
                                <h4 className="font-semibold mb-2 text-gray-700">ความเชื่อมโยงกับแผนยุทธศาสตร์</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    <p><span className="font-medium">แผนพัฒนารายประเด็น:</span> {project.development_guideline || '-'}</p>
                                    <p><span className="font-medium">เป้าหมาย (Objective):</span> {project.objective || '-'}</p>
                                    <p><span className="font-medium">ตัวชี้วัดกำกับ (Governance):</span> {project.governance_indicator || '-'}</p>
                                    <p><span className="font-medium">ค่าเป้าหมายรายปี:</span> {project.annual_target || '-'}</p>
                                </div>
                            </div>

                            <div><span className="text-gray-500 block">รหัสโครงการ</span> {project.id}</div>
                            <div><span className="text-gray-500 block">ปีงบประมาณ</span> {project.fiscal_year}</div>

                            <div><span className="text-gray-500 block">หน่วยงานรับผิดชอบ</span> {project.agency}</div>
                            <div><span className="text-gray-500 block">หน่วยงานสนับสนุน</span> {project.support_agency || '-'}</div>

                            <div><span className="text-gray-500 block">งบประมาณ</span> {Number(project.budget).toLocaleString()} บาท</div>
                            <div><span className="text-gray-500 block">แหล่งงบประมาณ</span> {project.source || '-'}</div>

                            <div><span className="text-gray-500 block">กลุ่มเป้าหมาย</span> {project.target_group || '-'}</div>
                            <div><span className="text-gray-500 block">จำนวนกลุ่มเป้าหมาย</span> {project.target_group_amount || '-'}</div>

                            <div><span className="text-gray-500 block">วันเริ่มต้น</span> {project.start_date}</div>
                            <div><span className="text-gray-500 block">วันสิ้นสุด</span> {project.end_date}</div>

                            <div><span className="text-gray-500 block">สถานะปัจจุบัน</span>
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold 
                                    ${project.status === 'Completed' || project.status === 'ดำเนินการแล้วเสร็จ' ? 'bg-green-100 text-green-800' :
                                        project.status === 'In Progress' || project.status === 'กำลังดำเนินการ' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'}`}>
                                    {project.status}
                                </span>
                            </div>
                            <div><span className="text-gray-500 block">ความคืบหน้า</span> {project.progress}%</div>
                            <div><span className="text-gray-500 block">เบิกจ่ายแล้ว</span> {Number(project.budget_spent || 0).toLocaleString()} บาท</div>
                        </div>
                    )}

                    {activeTab === 'indicators' && (
                        <div className="space-y-3">
                            {indicators.length === 0 ? <p className="text-gray-500 italic">ไม่มีข้อมูลตัวชี้วัด</p> :
                                indicators.map(ind => (
                                    <div key={ind.id} className="p-3 border rounded-lg bg-gray-50">
                                        <p className="font-medium">{ind.name}</p>
                                        <div className="flex gap-4 mt-2 text-xs text-gray-600">
                                            <span>เป้าหมาย: <span className="font-semibold text-gray-900">{ind.target} {ind.unit}</span></span>
                                            <span>ผลการดำเนินงานล่าสุด: <span className="font-semibold text-indigo-600">{ind.result || '-'}</span></span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            {reports.length === 0 ? <p className="text-gray-500 italic">ยังไม่มีการรายงานผล</p> :
                                reports.map((report, idx) => (
                                    <div key={idx} className="border-l-4 border-indigo-400 pl-4 py-2">
                                        <div className="text-xs text-gray-500">{new Date(report.submissionDate).toLocaleDateString('th-TH')}</div>
                                        <div className="font-medium text-gray-900 mt-1">
                                            ความคืบหน้า: {report.progress}% | ใช้เงิน: {Number(report.budgetSpent).toLocaleString()} บาท
                                        </div>
                                        <div className="text-sm text-gray-700 mt-1">
                                            <span className="font-medium">ผลการดำเนินงาน:</span> {report.performance}
                                        </div>
                                        {report.issues && <div className="text-sm text-red-600 mt-1"><span className="font-medium">ปัญหา:</span> {report.issues}</div>}
                                        {report.activities && <div className="text-sm text-gray-600 mt-1"><span className="font-medium">กิจกรรม:</span> {report.activities}</div>}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            )}

            <div className="mt-6 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm font-medium"
                >
                    ปิด
                </button>
            </div>
        </Modal>
    );
}
