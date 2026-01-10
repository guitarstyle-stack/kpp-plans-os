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
    pictureUrl: string;
    role: string;
}

export interface Project {
    id: string;
    name: string; // Keep for backward compatibility
    project_name?: string; // New field
    agency: string;
    target_group?: string;
    budget: string;
    source?: string;
    status: string;
    progress: string;
    start_date: string;
    end_date: string;
    last_updated?: string;
    fiscal_year: string;
    responsible_person?: string;
    description?: string;
    _rowIndex?: number;
}

export interface Department {
    id: string;
    name: string;
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
    performance: string;
    issues: string;
    indicatorResults: Record<string, string>; // JSON stringified in Sheet
    _rowIndex?: number;
}
