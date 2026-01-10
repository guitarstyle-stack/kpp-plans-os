
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { addReport, getReportsByProject } from '@/lib/dataService';

export const dynamic = 'force-dynamic';

interface UserSession {
    userId: string;
    role: string;
    [key: string]: unknown;
}

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
        return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    try {
        const reports = await getReportsByProject(projectId);
        // Sort by date descending
        reports.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
        return NextResponse.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const sessionData = await getSession();
    const session = sessionData as unknown as UserSession;

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { projectId, progress, budgetSpent, performance, issues, indicatorResults } = body;

        if (!projectId || progress === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await addReport({
            projectId,
            userId: session.userId,
            submissionDate: new Date().toISOString(),
            progress: Number(progress),
            budgetSpent: Number(budgetSpent || 0),
            performance: performance || '',
            issues: issues || '',
            indicatorResults: indicatorResults || {}
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error submitting report:', error);
        return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
    }
}
