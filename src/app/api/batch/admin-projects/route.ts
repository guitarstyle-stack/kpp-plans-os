import { NextResponse } from 'next/server';
import { getProjects } from '@/lib/dataService';
import { getDepartments } from '@/lib/departmentService';
import { getProjectCategories } from '@/lib/dataService';

// Batched endpoint for admin projects page
export async function GET() {
    try {
        // Fetch all data in parallel (but they all hit cache layer)
        const [projects, departments] = await Promise.all([
            getProjects(),
            getDepartments(),
        ]);

        return NextResponse.json({
            projects,
            departments,
        });
    } catch (error) {
        console.error('Batch API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch data' },
            { status: 500 }
        );
    }
}
