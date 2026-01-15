import { NextResponse } from 'next/server';
import { getProjects, getProjectCategories } from '@/lib/dataService';
import { getDepartments } from '@/lib/departmentService';

// Batched endpoint for user management page
export async function GET() {
    try {
        const [projects, departments, categories] = await Promise.all([
            getProjects(),
            getDepartments(),
            getProjectCategories(),
        ]);

        return NextResponse.json({
            projects,
            departments,
            categories,
        });
    } catch (error) {
        console.error('Batch dashboard API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}
