import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateProjectProgress } from '@/lib/projectService';

export const dynamic = 'force-dynamic';

interface UserSession {
    userId: string;
    [key: string]: unknown;
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const sessionData = await getSession();
    const session = sessionData as unknown as UserSession;

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { progress } = await request.json();
        const { id } = await params;

        if (!progress || !id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const updatedProject = await updateProjectProgress(id, progress, session.userId);
        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error('Error updating progress:', error);
        return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
    }
}
