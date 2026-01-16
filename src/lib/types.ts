export interface User {
    id: string;
    line_user_id: string;
    display_name: string;
    picture_url: string;
    role: 'admin' | 'user';
    status: 'active' | 'inactive';
    last_login: string;
    first_name?: string;
    last_name?: string;
    position?: string;
    department_id?: string;
    phone?: string;
    email?: string;
    _rowIndex?: number;
}

export interface UserSession {
    userId: string;
    displayName: string;
    firstName?: string; // Formal first name
    lastName?: string;  // Formal last name
    pictureUrl: string;
    role: string;
}

export interface ProjectCategory {
    id: string;
    name: string;
    description?: string;
    fiscal_year?: string;
    _rowIndex?: number;
}

export interface Project {
    id: string;
    name: string; // Keep for backward compatibility
    project_name?: string; // New field
    categoryId?: string; // New field for category
    agency: string;
    target_group?: string;
    target_group_amount?: string; // New field for amount/quantity
    budget: string;
    source?: string;
    status: string;
    progress: string;
    start_date: string;
    end_date: string;
    last_updated?: string;
    fiscal_year: string;
    budget_spent?: number; // Added for budget-based progress
    responsible_person?: string;
    description?: string;
    _rowIndex?: number;
    performance?: string; // Latest performance status
    development_guideline?: string; // แนวทางการพัฒนา
    governance_indicator?: string; // ตัวชี้วัดของแนวทางพัฒนา
    annual_target?: string; // ค่าเป้าหมาย รายปี
    objective?: string; // วัตถุประสงค์ ของโครงการ
    support_agency?: string; // หน่วยงานรับผิดชอบ (สนับสนุน)

    // Links to Master Data
    strategicPlanId?: string;
    strategicGoalId?: string;
}

export interface Department {
    id: string;
    name: string;
    organization_type?: 'government' | 'private' | 'local_government' | 'civil_society' | 'other';
}

export interface Indicator {
    id: string;
    projectId: string;
    name: string;
    target: string;
    unit: string;
    result?: string;
    _rowIndex?: number;
}

export interface ProjectReport {
    id: string;
    projectId: string;
    userId: string;
    submissionDate: string;
    progress: number;
    budgetSpent: number;
    performance: 'บรรลุวัตถุประสงค์' | 'อยู่ระหว่างดำเนินการ' | string;
    issues: string;
    activities?: string; // New field for activities
    indicatorResults: Record<string, IndicatorResultValue>;
    _rowIndex?: number;
}

export interface ProjectsResponse {
    data: Project[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export type IndicatorResultValue = string | number | null; // More explicit type



export interface StrategicPlan {
    id: string;
    name: string; // development_guideline
    fiscal_year: string;
    description?: string;
    _rowIndex?: number;
}

export interface StrategicGoal {
    id: string;
    planId: string;
    name: string; // objective
    description?: string;
    _rowIndex?: number;
}

export interface StrategicIndicator {
    id: string;
    goalId: string;
    name: string; // governance_indicator
    recommended_target?: string;
    unit?: string;
    description?: string;
    _rowIndex?: number;
}

