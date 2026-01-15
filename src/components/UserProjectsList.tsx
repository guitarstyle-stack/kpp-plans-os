'use client';

// Force refresh
import { useState, useEffect } from 'react';
import { Project, Indicator, ProjectCategory, ProjectReport, StrategicPlan, StrategicGoal, StrategicIndicator } from '@/lib/types';
import toast from 'react-hot-toast';
import Modal from './ui/Modal';
import ConfirmationModal from './ui/ConfirmationModal';

export default function UserProjectsList({ userDepartment, userDepartmentId }: { userDepartment?: string; userDepartmentId?: string }) {
    console.log('Client Component - userDepartmentId:', userDepartmentId);
    console.log('Client Component - userDepartment:', userDepartment);
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear() + 543 + '');
    const [selectedDashboardPlan, setSelectedDashboardPlan] = useState<string>('all');
    const [dashboardPlans, setDashboardPlans] = useState<StrategicPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    // Create Project State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createFormData, setCreateFormData] = useState<Partial<Project>>({});
    const [createIndicators, setCreateIndicators] = useState<Partial<Indicator>[]>([]);

    // Master Data State for Creation Form
    const [strategicPlans, setStrategicPlans] = useState<StrategicPlan[]>([]);
    const [strategicGoals, setStrategicGoals] = useState<StrategicGoal[]>([]);
    const [strategicIndicatorsList, setStrategicIndicatorsList] = useState<StrategicIndicator[]>([]);

    // Determine Fiscal Year for fetching plans
    const currentFiscalYear = new Date().getFullYear() + 543 + '';

    useEffect(() => {
        if (showCreateModal) {
            // Default to current year or selected year
            const year = createFormData.fiscal_year || currentFiscalYear;
            fetchStrategicPlans(year);
        }
    }, [showCreateModal, createFormData.fiscal_year]);

    const fetchStrategicPlans = async (year: string) => {
        try {
            const res = await fetch(`/api/strategic-plans?fiscalYear=${year}`);
            if (res.ok) setStrategicPlans(await res.json());
        } catch (error) { console.error(error); }
    };

    const handlePlanChange = async (planId: string) => {
        const plan = strategicPlans.find(p => p.id === planId);
        setCreateFormData(prev => ({
            ...prev,
            strategicPlanId: planId,
            development_guideline: plan?.name || '',
            strategicGoalId: '',
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
        setCreateFormData(prev => ({
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
            setCreateFormData(prev => ({
                ...prev,
                governance_indicator: ind.name,
                annual_target: ind.recommended_target || prev.annual_target,
            }));

            if (createIndicators.length === 0) {
                setCreateIndicators([{
                    name: ind.name,
                    target: ind.recommended_target || '',
                    unit: ind.unit || ''
                }]);
            }
        }
    };

    const handleEditPlanChange = async (planId: string) => {
        const plan = strategicPlans.find(p => p.id === planId);
        setEditFormData(prev => ({
            ...prev,
            strategicPlanId: planId,
            development_guideline: plan?.name || '',
            strategicGoalId: '',
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

    const handleEditGoalChange = async (goalId: string) => {
        const goal = strategicGoals.find(g => g.id === goalId);
        setEditFormData(prev => ({
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

    const handleEditStrategicIndicatorSelect = (indId: string) => {
        const ind = strategicIndicatorsList.find(i => i.id === indId);
        if (ind) {
            setEditFormData(prev => ({
                ...prev,
                governance_indicator: ind.name,
                annual_target: ind.recommended_target || prev.annual_target,
            }));

            if (editIndicators.length === 0) {
                setEditIndicators([{
                    name: ind.name,
                    target: ind.recommended_target || '',
                    unit: ind.unit || ''
                }]);
            }
        }
    };

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
        activities: '', // [NEW] Feature 3
        indicatorResults: {} as Record<string, string>
    });

    // Report History State [NEW] Feature 4
    const [reportHistory, setReportHistory] = useState<ProjectReport[]>([]);
    const [detailTab, setDetailTab] = useState<'overview' | 'history'>('overview');

    useEffect(() => {
        fetchProjects();
    }, []);

    // Fetch plans for dashboard filter when year changes
    useEffect(() => {
        if (selectedYear !== 'all') {
            fetchDashboardPlans(selectedYear);
        } else {
            setDashboardPlans([]);
        }
        setSelectedDashboardPlan('all'); // Reset plan filter when year changes
    }, [selectedYear]);

    // Fetch plans for edit modal when fiscal year changes
    useEffect(() => {
        if (showEditModal && editFormData.fiscal_year) {
            fetchStrategicPlans(editFormData.fiscal_year);
        }
    }, [showEditModal, editFormData.fiscal_year]);

    const fetchDashboardPlans = async (year: string) => {
        try {
            const res = await fetch(`/api/strategic-plans?fiscalYear=${year}`);
            if (res.ok) setDashboardPlans(await res.json());
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        let res = projects;

        if (selectedYear !== 'all') {
            res = res.filter(p => p.fiscal_year === selectedYear);
        }

        if (selectedDashboardPlan !== 'all') {
            res = res.filter(p => p.strategicPlanId === selectedDashboardPlan);
        }

        setFilteredProjects(res);
    }, [selectedYear, selectedDashboardPlan, projects]);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
                setFilteredProjects(data);
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
            status: 'ยังไม่ดำเนินการ',
            progress: '0',
            fiscal_year: new Date().getFullYear() + 543 + '',
            target_group: '',
            target_group_amount: '',
            responsible_person: '',
            description: '',
            development_guideline: '',
            governance_indicator: '',
            annual_target: '',
            objective: '',
            support_agency: ''
        });
        setCreateIndicators([]);
        if (!userDepartmentId) {
            toast.error('กรุณาระบุหน่วยงานต้นสังกัดในข้อมูลส่วนตัวก่อนสร้างโครงการ');
            return;
        }
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

        // Strict Validation: Check Department ID again
        if (!userDepartmentId) {
            toast.error('กรุณาระบุหน่วยงานต้นสังกัดในข้อมูลส่วนตัวก่อน');
            return;
        }

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

        // Handle Date object string
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

    const handleEditProject = async (project: Project) => {
        setSelectedProject(project);
        setEditFormData({
            ...project,
            start_date: formatDateForInput(project.start_date),
            end_date: formatDateForInput(project.end_date)
        });
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

        // Fetch master data for the project's year/plan/goal to populate dropdowns
        if (project.fiscal_year) {
            fetchStrategicPlans(project.fiscal_year);
        }
        if (project.strategicPlanId) {
            try {
                const res = await fetch(`/api/strategic-goals?planId=${project.strategicPlanId}`);
                if (res.ok) setStrategicGoals(await res.json());
            } catch (error) { console.error(error); }
        }
        if (project.strategicGoalId) {
            try {
                const res = await fetch(`/api/strategic-indicators?goalId=${project.strategicGoalId}`);
                if (res.ok) setStrategicIndicatorsList(await res.json());
            } catch (error) { console.error(error); }
        }

        setShowEditModal(true);
    };

    const submitEditProject = async (e: React.FormEvent) => {
        e.preventDefault();

        // Strict Validation
        if (!userDepartmentId && !selectedProject?.agency) {
            // For editing, we might allow if project has agency, but if user is editing, 
            // we usually expect them to have a department context. 
            // However, for safety, let's just log or ensure standard validation.
            // Actually, user requested "Check every time". 
            // If user has no department, they shouldn't be here?
            // But let's add the check if they are trying to "set" agency.
        }

        if (!userDepartmentId) {
            toast.error('กรุณาระบุหน่วยงานต้นสังกัดในข้อมูลส่วนตัวก่อนแก้ไขโครงการ');
            return;
        }

        if (!selectedProject) return;
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
                const errorData = await res.json().catch(() => ({}));
                console.error('Edit Error:', errorData);
                toast.error(`ไม่สามารถแก้ไขโครงการได้: ${errorData.error || res.statusText}`);
            }
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
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
        setDetailTab('overview'); // Reset tab
        fetchReportHistory(project.id); // Fetch history
        setShowDetailModal(true);
    };

    const fetchReportHistory = async (projectId: string) => {
        try {
            const res = await fetch(`/api/reports?projectId=${projectId}`);
            if (res.ok) {
                const data = await res.json();
                setReportHistory(data);
            }
        } catch (error) {
            console.error('Failed to load report history', error);
        }
    };

    const handleReportProgress = async (project: Project) => {
        setSelectedProject(project);
        setReportData({
            progress: project.progress,
            budgetSpent: '0',
            performance: '',
            issues: '',
            activities: '', // Reset activities
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
                    budgetSpent: Number(reportData.budgetSpent),
                    activities: reportData.activities // Include activities
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
                <div className="flex space-x-4">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="all">ทุกปีงบประมาณ</option>
                        {[...Array(5)].map((_, i) => {
                            const year = new Date().getFullYear() + 543 - 2 + i;
                            return <option key={year} value={year}>{year}</option>;
                        })}
                    </select>

                    {selectedYear !== 'all' && (
                        <select
                            value={dashboardPlans.length > 0 ? selectedDashboardPlan : 'empty'}
                            onChange={(e) => setSelectedDashboardPlan(e.target.value)}
                            disabled={dashboardPlans.length === 0}
                            className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm max-w-xs"
                        >
                            {dashboardPlans.length === 0 ? (
                                <option value="empty">-ยังไม่มีแผนรายประเด็น-</option>
                            ) : (
                                <>
                                    <option value="all">ทุกแผนพัฒนารายประเด็น</option>
                                    {dashboardPlans.map((plan) => (
                                        <option key={plan.id} value={plan.id}>{plan.name}</option>
                                    ))}
                                </>
                            )}
                        </select>
                    )}
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
            </div>

            {filteredProjects.length === 0 ? (
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
                            {filteredProjects.map((project) => (
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="grid grid-cols-2 gap-2 max-w-[180px]">
                                            <button
                                                onClick={() => handleReportProgress(project)}
                                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1.5 rounded-md flex justify-center items-center gap-1 text-xs"
                                                title="รายงานผล"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                                รายงาน
                                            </button>
                                            <button
                                                onClick={() => handleViewDetail(project)}
                                                className="text-gray-600 hover:text-gray-900 bg-gray-50 px-2 py-1.5 rounded-md flex justify-center items-center gap-1 text-xs"
                                                title="รายละเอียด"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                ดูข้อมูล
                                            </button>
                                            <button
                                                onClick={() => handleEditProject(project)}
                                                className="text-amber-600 hover:text-amber-900 bg-amber-50 px-2 py-1.5 rounded-md flex justify-center items-center gap-1 text-xs"
                                                title="แก้ไข"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                แก้ไข
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProject(project)}
                                                className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1.5 rounded-md flex justify-center items-center gap-1 text-xs"
                                                title="ลบ"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                ลบ
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Warning if no department */}
            {!userDepartmentId && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                ท่านยังไม่ได้ระบุหน่วยงานต้นสังกัด กรุณา <a href="/profile" className="font-medium underline hover:text-yellow-600">แก้ไขข้อมูลส่วนตัว</a> เพื่อระบุหน่วยงานก่อนเริ่มใช้งาน
                            </p>
                        </div>
                    </div>
                </div>
            )}



            {/* Create Project Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="สร้างโครงการใหม่"
                maxWidth="max-w-2xl"
            >
                <form onSubmit={submitCreateProject} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ปีงบประมาณ</label>
                            <select
                                required
                                value={createFormData.fiscal_year || ''}
                                onChange={(e) => setCreateFormData({ ...createFormData, fiscal_year: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
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
                                    value={createFormData.strategicPlanId || ''}
                                    onChange={(e) => handlePlanChange(e.target.value)}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm mb-2"
                                >
                                    <option value="">-- เลือกแผน --</option>
                                    {strategicPlans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <label className="block text-xs text-gray-500 text-right">แนวทางการพัฒนา (ระบบเติมให้อัตโนมัติ)</label>
                                <textarea
                                    rows={2}
                                    value={createFormData.development_guideline || ''}
                                    onChange={(e) => setCreateFormData({ ...createFormData, development_guideline: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            {/* 2. Objective (Strategic Goal) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">เลือกเป้าหมาย</label>
                                <select
                                    value={createFormData.strategicGoalId || ''}
                                    onChange={(e) => handleGoalChange(e.target.value)}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm mb-2"
                                    disabled={!createFormData.strategicPlanId}
                                >
                                    <option value="">-- เลือกเป้าหมาย --</option>
                                    {strategicGoals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                                <label className="block text-xs text-gray-500 text-right">วัตถุประสงค์ (ระบบเติมให้อัตโนมัติ)</label>
                                <textarea
                                    rows={3}
                                    value={createFormData.objective || ''}
                                    onChange={(e) => setCreateFormData({ ...createFormData, objective: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            {/* 3. Governance Indicator */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เลือกตัวชี้วัดจากแผน (Optional)</label>
                                <select
                                    onChange={(e) => handleStrategicIndicatorSelect(e.target.value)}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm mb-2"
                                    disabled={!createFormData.strategicGoalId}
                                    value=""
                                >
                                    <option value="">-- เลือกเพื่อนำเข้าข้อมูล --</option>
                                    {strategicIndicatorsList.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                                <label className="block text-xs text-gray-500 text-right">ตัวชี้วัดของแนวทางพัฒนา</label>
                                <input
                                    type="text"
                                    value={createFormData.governance_indicator || ''}
                                    onChange={(e) => setCreateFormData({ ...createFormData, governance_indicator: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* 3. Annual Target */}
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700">ค่าเป้าหมาย รายปี ({createFormData.fiscal_year})</label>
                            <input
                                type="text"
                                value={createFormData.annual_target || ''}
                                onChange={(e) => setCreateFormData({ ...createFormData, annual_target: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        {/* 4. Project Name */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">โครงการ/กิจกรรม</label>
                            <input
                                type="text"
                                required
                                value={createFormData.project_name || ''}
                                onChange={(e) => setCreateFormData({ ...createFormData, project_name: e.target.value })}
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

                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700">กลุ่มเป้าหมาย (รายละเอียด)</label>
                            <input
                                type="text"
                                placeholder="เช่น เกษตรกรในพื้นที่, นักเรียน"
                                value={createFormData.target_group || ''}
                                onChange={(e) => setCreateFormData({ ...createFormData, target_group: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm mb-2"
                            />
                            <div className="flex gap-2 items-center">
                                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">จำนวน:</label>
                                <input
                                    type="text"
                                    placeholder="ระบุจำนวน (เช่น 50 คน)"
                                    value={createFormData.target_group_amount || ''}
                                    onChange={(e) => setCreateFormData({ ...createFormData, target_group_amount: e.target.value })}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-1.5 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* 10. Responsible Agencies */}
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700">หน่วยงานรับผิดชอบ (หลัก)</label>
                            <input
                                type="text"
                                disabled
                                value={createFormData.agency || ''}
                                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm text-gray-500"
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700">หน่วยงานรับผิดชอบ (สนับสนุน)</label>
                            <input
                                type="text"
                                value={createFormData.support_agency || ''}
                                onChange={(e) => setCreateFormData({ ...createFormData, support_agency: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">ผู้รับผิดชอบโครงการ</label>
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
                maxWidth="max-w-2xl"
            >
                <form onSubmit={submitEditProject} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 1. Development Guideline */}
                        {/* 0. Fiscal Year - Moved up for hierarchy flow */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ปีงบประมาณ</label>
                            <select
                                required
                                value={editFormData.fiscal_year || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, fiscal_year: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            >
                                {[...Array(5)].map((_, i) => {
                                    const year = new Date().getFullYear() + 543 - 2 + i;
                                    return <option key={year} value={year}>{year}</option>;
                                })}
                            </select>
                        </div>

                        {/* Master Data Section - Grouped */}
                        <div className="col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b text-amber-600 pb-1">ข้อมูลแผนพัฒนารายประเด็น (Master Data)</h3>

                            {/* 1. Development Guideline (Strategic Plan) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">เลือกแผนพัฒนารายประเด็น</label>
                                <select
                                    value={editFormData.strategicPlanId || ''}
                                    onChange={(e) => handleEditPlanChange(e.target.value)}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm mb-2"
                                >
                                    <option value="">-- เลือกแผน --</option>
                                    {strategicPlans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <label className="block text-xs text-gray-500 text-right">แนวทางการพัฒนา (ระบบเติมให้อัตโนมัติ)</label>
                                <textarea
                                    rows={2}
                                    value={editFormData.development_guideline || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, development_guideline: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            {/* 2. Objective (Strategic Goal) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">เลือกเป้าหมาย</label>
                                <select
                                    value={editFormData.strategicGoalId || ''}
                                    onChange={(e) => handleEditGoalChange(e.target.value)}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm mb-2"
                                    disabled={!editFormData.strategicPlanId}
                                >
                                    <option value="">-- เลือกเป้าหมาย --</option>
                                    {strategicGoals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                                <label className="block text-xs text-gray-500 text-right">วัตถุประสงค์ (ระบบเติมให้อัตโนมัติ)</label>
                                <textarea
                                    rows={3}
                                    value={editFormData.objective || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, objective: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            {/* 3. Governance Indicator */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เลือกตัวชี้วัดจากแผน (Optional)</label>
                                <select
                                    onChange={(e) => handleEditStrategicIndicatorSelect(e.target.value)}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm mb-2"
                                    disabled={!editFormData.strategicGoalId}
                                    value=""
                                >
                                    <option value="">-- เลือกเพื่อนำเข้าข้อมูล --</option>
                                    {strategicIndicatorsList.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                                <label className="block text-xs text-gray-500 text-right">ตัวชี้วัดของแนวทางพัฒนา</label>
                                <input
                                    type="text"
                                    value={editFormData.governance_indicator || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, governance_indicator: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* 3. Annual Target */}
                        {/* 3. Annual Target */}
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700">ค่าเป้าหมาย รายปี ({editFormData.fiscal_year})</label>
                            <input
                                type="text"
                                value={editFormData.annual_target || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, annual_target: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">โครงการ/กิจกรรม</label>
                            <input
                                type="text"
                                required
                                value={editFormData.project_name || editFormData.name || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, project_name: e.target.value })}
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
                            <label className="block text-sm font-medium text-gray-700">กลุ่มเป้าหมาย (รายละเอียด)</label>
                            <input
                                type="text"
                                placeholder="เช่น เกษตรกรในพื้นที่, นักเรียน"
                                value={editFormData.target_group || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, target_group: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm mb-2"
                            />
                            <div className="flex gap-2 items-center">
                                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">จำนวน:</label>
                                <input
                                    type="text"
                                    placeholder="ระบุจำนวน (เช่น 50 คน)"
                                    value={editFormData.target_group_amount || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, target_group_amount: e.target.value })}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-1.5 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700">หน่วยงานรับผิดชอบ (หลัก)</label>
                            <input
                                type="text"
                                disabled
                                value={editFormData.agency || ''}
                                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm text-gray-500"
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700">หน่วยงานรับผิดชอบ (สนับสนุน)</label>
                            <input
                                type="text"
                                value={editFormData.support_agency || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, support_agency: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">ผู้รับผิดชอบโครงการ</label>
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
                    <div className="flex space-x-4 border-b border-gray-200 mb-4">
                        <button
                            className={`pb-2 px-1 ${detailTab === 'overview' ? 'border-b-2 border-indigo-500 text-indigo-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setDetailTab('overview')}
                        >
                            ข้อมูลทั่วไป
                        </button>
                        <button
                            className={`pb-2 px-1 ${detailTab === 'history' ? 'border-b-2 border-indigo-500 text-indigo-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setDetailTab('history')}
                        >
                            ประวัติการรายงาน
                        </button>
                    </div>

                    {detailTab === 'overview' ? (
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
                                <p className="text-gray-900">{Number(selectedProject.budget).toLocaleString()}</p>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">แหล่งงบประมาณ</label>
                                    <p className="text-gray-900">{selectedProject.source || '-'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">กลุ่มเป้าหมาย</label>
                                    <p className="text-gray-900">{selectedProject.target_group || '-'}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">ผลการดำเนินงานล่าสุด</label>
                                <p className={`font-medium ${selectedProject.performance === 'บรรลุวัตถุประสงค์' ? 'text-green-600' :
                                    selectedProject.performance === 'อยู่ระหว่างดำเนินการ' ? 'text-yellow-600' : 'text-gray-500'
                                    }`}>
                                    {selectedProject.performance || 'ยังไม่มีการรายงาน'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">ผู้รับผิดชอบ</label>
                                <p className="text-gray-900">{selectedProject.responsible_person || '-'}</p>
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
                    ) : (
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                            {reportHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {reportHistory.map((report, idx) => (
                                        <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="text-sm text-gray-500">
                                                    รายงานเมื่อ: {new Date(report.submissionDate).toLocaleDateString('th-TH')}
                                                </div>
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${Number(report.progress) >= 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {report.progress}%
                                                </span>
                                            </div>
                                            {report.activities && (
                                                <div className="mb-2">
                                                    <p className="text-xs font-semibold text-gray-700">กิจกรรมที่ดำเนินการ:</p>
                                                    <p className="text-sm text-gray-900">{report.activities}</p>
                                                </div>
                                            )}
                                            {report.issues && (
                                                <div className="mb-2">
                                                    <p className="text-xs font-semibold text-red-700">ปัญหา/อุปสรรค:</p>
                                                    <p className="text-sm text-red-600">{report.issues}</p>
                                                </div>
                                            )}
                                            {report.performance && (
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-700">ผลการดำเนินงาน:</p>
                                                    <p className="text-sm text-gray-900">{report.performance}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">ยังไม่มีประวัติการรายงาน</p>
                            )}
                        </div>
                    )}
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
                        {/* 1. Financials & Progress Section */}
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                            <h4 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                ข้อมูลงบประมาณ
                            </h4>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-white p-3 rounded shadow-sm">
                                    <span className="text-xs text-gray-500 block">งบประมาณทั้งหมด</span>
                                    <span className="font-semibold text-gray-900 text-lg">{Number(selectedProject.budget).toLocaleString()}</span>
                                </div>
                                <div className="bg-white p-3 rounded shadow-sm">
                                    <span className="text-xs text-gray-500 block">ใช้ไปแล้ว (สะสม)</span>
                                    <span className="font-semibold text-gray-600 text-lg">{Number(selectedProject.budget_spent || 0).toLocaleString()}</span>
                                </div>
                                <div className="bg-white p-3 rounded shadow-sm">
                                    <span className="text-xs text-gray-500 block">คงเหลือ</span>
                                    <span className={`font-semibold text-lg ${Number(selectedProject.budget) - Number(selectedProject.budget_spent || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {(Number(selectedProject.budget) - Number(selectedProject.budget_spent || 0)).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded shadow-sm space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ระบุงบประมาณที่ใช้ (งวดนี้)</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <input
                                            type="number"
                                            min="0"
                                            className="block w-full pr-12 text-right border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg font-medium"
                                            placeholder="0.00"
                                            value={reportData.budgetSpent}
                                            onChange={(e) => {
                                                const spentThisPeriod = parseFloat(e.target.value) || 0;
                                                const previousSpent = parseFloat((selectedProject.budget_spent || 0).toString());
                                                const totalBudget = parseFloat((selectedProject.budget || 0).toString());

                                                const totalSpent = previousSpent + spentThisPeriod;
                                                let newProgress = 0;
                                                if (totalBudget > 0) {
                                                    newProgress = (totalSpent / totalBudget) * 100;
                                                    if (newProgress > 100) newProgress = 100;
                                                }

                                                setReportData({
                                                    ...reportData,
                                                    budgetSpent: e.target.value,
                                                    progress: newProgress.toFixed(2)
                                                });
                                            }}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">บาท</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-sm font-medium text-gray-700">ความคืบหน้าสะสม (อัตโนมัติ)</span>
                                        <span className="text-2xl font-bold text-indigo-600">{reportData.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-3 rounded-full transition-all duration-500 ${Number(reportData.progress) >= 100 ? 'bg-green-500' : 'bg-indigo-600'}`}
                                            style={{ width: `${Math.min(Number(reportData.progress), 100)}%` }}
                                        ></div>
                                    </div>
                                    {Number(reportData.progress) >= 100 && (
                                        <p className="text-xs text-green-600 mt-1 flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            ดำเนินการแล้วเสร็จ
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. KPIs Section */}
                        {projectIndicators.length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    บันทึกผลตัวชี้วัด (KPIs)
                                </h4>
                                <div className="bg-white rounded-md shadow-sm overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ตัวชี้วัด</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">เป้าหมาย</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ผลลัพธ์ล่าสุด</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {projectIndicators.map((ind) => (
                                                <tr key={ind.id}>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{ind.name}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{ind.target} {ind.unit}</td>
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="text"
                                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                            placeholder="ระบุผลลัพธ์"
                                                            value={reportData.indicatorResults[ind.id] || ''}
                                                            onChange={(e) => setReportData(prev => ({
                                                                ...prev,
                                                                indicatorResults: {
                                                                    ...prev.indicatorResults,
                                                                    [ind.id]: e.target.value
                                                                }
                                                            }))}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 3. Qualitative Report Section */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                รายงานผลการดำเนินงาน
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">กิจกรรมที่ดำเนินการ (Activities)</label>
                                    <textarea
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm placeholder-gray-400"
                                        rows={3}
                                        placeholder="ระบุกิจกรรมที่ได้ดำเนินการ..."
                                        value={reportData.activities}
                                        onChange={(e) => setReportData({ ...reportData, activities: e.target.value })}
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ผลการดำเนินงานหลัก</label>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center">
                                            <input
                                                id="perf-achieved"
                                                name="performance"
                                                type="radio"
                                                value="บรรลุวัตถุประสงค์"
                                                checked={reportData.performance === 'บรรลุวัตถุประสงค์'}
                                                onChange={(e) => setReportData({ ...reportData, performance: e.target.value })}
                                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                            />
                                            <label htmlFor="perf-achieved" className="ml-3 block text-sm font-medium text-gray-700">
                                                บรรลุวัตถุประสงค์
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                id="perf-inprogress"
                                                name="performance"
                                                type="radio"
                                                value="อยู่ระหว่างดำเนินการ"
                                                checked={reportData.performance === 'อยู่ระหว่างดำเนินการ'}
                                                onChange={(e) => setReportData({ ...reportData, performance: e.target.value })}
                                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                            />
                                            <label htmlFor="perf-inprogress" className="ml-3 block text-sm font-medium text-gray-700">
                                                อยู่ระหว่างดำเนินการ
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ปัญหา / อุปสรรค (ถ้ามี)</label>
                                    <textarea
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-red-600 placeholder-gray-400"
                                        rows={2}
                                        placeholder="ระบุปัญหาที่พบ..."
                                        value={reportData.issues}
                                        onChange={(e) => setReportData({ ...reportData, issues: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-2">
                            <div className="text-xs text-gray-500">
                                * การรายงานผลจะอัปเดตสถานะโครงการโดยอัตโนมัติ
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={submitReport}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 transition-colors flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    บันทึกรายงาน
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )
            }
        </div >
    );
}
