import { NextRequest, NextResponse } from 'next/server';
import { updateProjectCategory, deleteProjectCategory } from '@/lib/dataService';
import { getSession } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const updatedCategory = await updateProjectCategory({
            id,
            ...body
        });
        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.error("Check categories PUT API Error:", error);
        return NextResponse.json({ error: 'Failed to update category', details: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        await deleteProjectCategory(id);
        return NextResponse.json({ message: 'Category deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
