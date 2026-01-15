import { NextRequest, NextResponse } from 'next/server';
import { updateProject, deleteProject, updateIndicators } from '@/lib/dataService';
import { getSession } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { indicators, ...projectData } = body;

        // Update Project Fields
        const result = await updateProject({ ...projectData, id });

        // Update Indicators if provided
        if (indicators && Array.isArray(indicators)) {
            await updateIndicators(id, indicators);
        }

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Update Project Error:', error);
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        await deleteProject(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }
}
