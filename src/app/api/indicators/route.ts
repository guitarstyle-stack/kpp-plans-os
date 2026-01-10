
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getIndicators, updateIndicators } from '@/lib/dataService';

export const dynamic = 'force-dynamic';

interface UserSession {
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
        const indicators = await getIndicators(projectId);
        return NextResponse.json(indicators);
    } catch (error) {
        console.error('Error fetching indicators:', error);
        return NextResponse.json({ error: 'Failed to fetch indicators' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const sessionData = await getSession();
    const session = sessionData as unknown as UserSession;

    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { projectId, indicators } = body;

        if (!projectId || !Array.isArray(indicators)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        await updateIndicators(projectId, indicators);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating indicators:', error);
        return NextResponse.json({ error: 'Failed to update indicators' }, { status: 500 });
    }
}
